import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../../services/database';

// ============================================
// TYPES
// ============================================

// Simple 3-level rating system
export type CardRating = 'still-learning' | 'somewhat' | 'know';

export interface CardProgress {
    cardId: string;
    deckId: string;
    // Spaced repetition values
    easeFactor: number;      // Multiplier for intervals (starts at 2.5)
    interval: number;        // Current interval in days
    repetitions: number;     // Number of successful reviews
    // Timestamps
    lastReviewed: string;    // ISO date string
    nextReview: string;      // ISO date string
    // Card status
    status: 'new' | 'learning' | 'reviewing' | 'mastered';
    // Stats
    timesStudied: number;
    timesCorrect: number;    // "Know" count
    timesSomewhat: number;   // "Somewhat" count
    timesWrong: number;      // "Still Learning" count
}

export interface StudySession {
    id: string;
    deckId: string;
    startTime: string;
    endTime?: string;
    cardsStudied: number;
    correctCount: number;
    somewhatCount: number;
    wrongCount: number;
}

export interface DeckStats {
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewingCards: number;
    masteredCards: number;
    dueToday: number;
    averageMastery: number;  // 0-100
}

export interface DailyStats {
    date: string;
    cardsStudied: number;
    timeSpentMinutes: number;
    correctCount: number;
    somewhatCount: number;
    wrongCount: number;
}

// ============================================
// CONTEXT
// ============================================

interface StudyProgressContextType {
    // Card progress (keys use server card UUIDs; scoped per deckId)
    cardProgress: Record<string, CardProgress>;
    updateCardProgress: (deckId: string, cardId: string, rating: CardRating) => void;
    getCardProgress: (deckId: string, cardId: string) => CardProgress | null;
    resetCardProgress: (deckId: string, cardId: string) => void;
    resetDeckProgress: (deckId: string) => void;

    // Due cards
    getDueCards: (deckId: string, cardIds: string[]) => string[];
    getNewCards: (deckId: string, cardIds: string[]) => string[];
    getLearningCards: (deckId: string, cardIds: string[]) => string[];

    // Deck stats (iterate known card IDs — aligns with Supabase `cards.id` UUIDs)
    getDeckStats: (deckId: string, cardIds: string[]) => DeckStats;

    // Sessions
    sessions: StudySession[];
    startSession: (deckId: string) => string;
    endSession: (sessionId: string) => void;
    recordCardResult: (sessionId: string, rating: CardRating) => void;

    // Daily stats
    dailyStats: DailyStats[];
    getTodaysStats: () => DailyStats;
    getWeeklyStats: () => DailyStats[];
    getStreak: () => number;

    // Overall stats
    getTotalCardsStudied: () => number;
    getTotalStudyTime: () => number;
}

const StudyProgressContext = createContext<StudyProgressContextType | undefined>(undefined);

// ============================================
// SPACED REPETITION ALGORITHM (Simplified SM-2)
// ============================================

function calculateNextReview(
    currentProgress: CardProgress | null,
    rating: CardRating
): { interval: number; easeFactor: number; repetitions: number; status: CardProgress['status'] } {
    // Default values for new cards
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;
    let status: CardProgress['status'] = 'new';

    if (currentProgress) {
        interval = currentProgress.interval;
        easeFactor = currentProgress.easeFactor;
        repetitions = currentProgress.repetitions;
    }

    switch (rating) {
        case 'still-learning':
            // Reset - card needs more learning
            repetitions = 0;
            interval = 0; // Review again soon (same session or next time)
            easeFactor = Math.max(1.3, easeFactor - 0.3); // Make it harder
            status = 'learning';
            break;

        case 'somewhat':
            // Partial success - small interval increase
            if (repetitions === 0) {
                interval = 1; // 1 day
            } else {
                interval = Math.ceil(interval * 1.2); // 20% increase
            }
            repetitions += 1;
            easeFactor = Math.max(1.3, easeFactor - 0.1); // Slight decrease
            status = repetitions >= 2 ? 'reviewing' : 'learning';
            break;

        case 'know':
            // Success - normal spaced repetition
            if (repetitions === 0) {
                interval = 1; // 1 day
            } else if (repetitions === 1) {
                interval = 3; // 3 days
            } else if (repetitions === 2) {
                interval = 7; // 1 week
            } else {
                interval = Math.ceil(interval * easeFactor); // Exponential growth
            }
            repetitions += 1;
            easeFactor = Math.min(3.0, easeFactor + 0.1); // Slight increase, max 3.0

            // Mastered after 5+ successful reviews with interval > 21 days
            if (repetitions >= 5 && interval > 21) {
                status = 'mastered';
            } else if (repetitions >= 2) {
                status = 'reviewing';
            } else {
                status = 'learning';
            }
            break;
    }

    return { interval, easeFactor, repetitions, status };
}

// ============================================
// PROVIDER
// ============================================

export function StudyProgressProvider({ children }: { children: ReactNode }) {
    const [cardProgress, setCardProgress] = useState<Record<string, CardProgress>>({});
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

    // Load initial state from DB on mount
    useEffect(() => {
        const syncFromDB = async () => {
            try {
                const [dbSessions, streakInfo, dbProgress] = await Promise.all([
                    db.getStudySessions(),
                    db.getStreakInfo(),
                    db.getStudyProgress()
                ]);

                if (dbSessions.length > 0) {
                    setSessions(dbSessions.map(s => ({
                        id: s.id,
                        deckId: s.deck_id,
                        startTime: s.start_time,
                        endTime: s.end_time,
                        cardsStudied: s.cards_studied,
                        correctCount: s.correct_count,
                        somewhatCount: s.somewhat_count,
                        wrongCount: s.wrong_count
                    })));
                }

                if (Object.keys(dbProgress).length > 0) {
                    setCardProgress(dbProgress);
                }

                // Note: dailyStats is still mostly useful for local rendering, 
                // but we should compute it from sessions to be accurate with DB.
                if (dbSessions.length > 0) {
                    const statsMap: Record<string, DailyStats> = {};
                    dbSessions.forEach(s => {
                        const date = s.start_time.split('T')[0];
                        if (!statsMap[date]) {
                            statsMap[date] = {
                                date,
                                cardsStudied: 0,
                                timeSpentMinutes: 0,
                                correctCount: 0,
                                somewhatCount: 0,
                                wrongCount: 0
                            };
                        }
                        statsMap[date].cardsStudied += s.cards_studied;
                        statsMap[date].correctCount += s.correct_count;
                        statsMap[date].somewhatCount += s.somewhat_count;
                        statsMap[date].wrongCount += s.wrong_count;
                        
                        if (s.end_time) {
                            const start = new Date(s.start_time).getTime();
                            const end = new Date(s.end_time).getTime();
                            statsMap[date].timeSpentMinutes += Math.round((end - start) / 60000);
                        }
                    });
                    setDailyStats(Object.values(statsMap));
                }
            } catch (e) {
                console.error('Failed to sync study progress from DB', e);
            }
        };
        void syncFromDB();
    }, []);

    // Persist to localStorage as fallback
    useEffect(() => {
        localStorage.setItem('studylayer_card_progress', JSON.stringify(cardProgress));
    }, [cardProgress]);

    useEffect(() => {
        localStorage.setItem('studylayer_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        localStorage.setItem('studylayer_daily_stats', JSON.stringify(dailyStats));
    }, [dailyStats]);

    // Delimiter avoids ambiguity between UUID segments (legacy keys used a single `_`).
    const getProgressKey = (deckId: string, cardId: string) => `${deckId}|${cardId}`;

    // ========== CARD PROGRESS ==========

    const updateCardProgress = async (deckId: string, cardId: string, rating: CardRating) => {
        const key = getProgressKey(deckId, cardId);
        const current = cardProgress[key] || null;
        const { interval, easeFactor, repetitions, status } = calculateNextReview(current, rating);

        const now = new Date();
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + interval);

        const updated: CardProgress = {
            cardId,
            deckId,
            easeFactor,
            interval,
            repetitions,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            status,
            timesStudied: (current?.timesStudied || 0) + 1,
            timesCorrect: (current?.timesCorrect || 0) + (rating === 'know' ? 1 : 0),
            timesSomewhat: (current?.timesSomewhat || 0) + (rating === 'somewhat' ? 1 : 0),
            timesWrong: (current?.timesWrong || 0) + (rating === 'still-learning' ? 1 : 0),
        };

        setCardProgress(prev => ({ ...prev, [key]: updated }));

        // Update daily stats
        void updateDailyStats(rating);
        
        // Sync to DB
        try {
            await db.saveStudyProgress(updated);
        } catch (e) {
            console.error('Failed to sync card progress to DB', e);
        }
    };

    const getCardProgress = (deckId: string, cardId: string): CardProgress | null => {
        const key = getProgressKey(deckId, cardId);
        return cardProgress[key] || null;
    };

    const resetCardProgress = (deckId: string, cardId: string) => {
        const key = getProgressKey(deckId, cardId);
        setCardProgress(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const resetDeckProgress = (deckId: string) => {
        const prefix = `${deckId}|`;
        const legacyPrefix = `${deckId}_`;
        setCardProgress(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                if (key.startsWith(prefix) || key.startsWith(legacyPrefix)) {
                    delete updated[key];
                }
            });
            return updated;
        });
    };

    // ========== DUE CARDS ==========

    const getDueCards = (deckId: string, cardIds: string[]): string[] => {
        const now = new Date();
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            if (!progress) return false; // New cards aren't "due"
            return new Date(progress.nextReview) <= now;
        });
    };

    const getNewCards = (deckId: string, cardIds: string[]): string[] => {
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            return !progress || progress.status === 'new';
        });
    };

    const getLearningCards = (deckId: string, cardIds: string[]): string[] => {
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            return progress?.status === 'learning';
        });
    };

    // ========== DECK STATS ==========

    const getDeckStats = (deckId: string, cardIds: string[]): DeckStats => {
        const now = new Date();
        let newCards = 0;
        let learningCards = 0;
        let reviewingCards = 0;
        let masteredCards = 0;
        let dueToday = 0;
        let totalMastery = 0;

        const totalCards = cardIds.length;

        for (const cardId of cardIds) {
            const progress = getCardProgress(deckId, cardId);

            if (!progress) {
                newCards++;
                continue;
            }

            switch (progress.status) {
                case 'new':
                    newCards++;
                    break;
                case 'learning':
                    learningCards++;
                    totalMastery += 25; // 25% mastery for learning
                    break;
                case 'reviewing':
                    reviewingCards++;
                    totalMastery += 60; // 60% mastery for reviewing
                    break;
                case 'mastered':
                    masteredCards++;
                    totalMastery += 100; // 100% mastery
                    break;
            }

            if (new Date(progress.nextReview) <= now) {
                dueToday++;
            }
        }

        const averageMastery = totalCards > 0 ? Math.round(totalMastery / totalCards) : 0;

        return {
            totalCards,
            newCards,
            learningCards,
            reviewingCards,
            masteredCards,
            dueToday,
            averageMastery
        };
    };

    // ========== SESSIONS ==========

    const startSession = (deckId: string): string => {
        const session: StudySession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            deckId,
            startTime: new Date().toISOString(),
            cardsStudied: 0,
            correctCount: 0,
            somewhatCount: 0,
            wrongCount: 0
        };
        setSessions(prev => [...prev, session]);
        return session.id;
    };

    const endSession = async (sessionId: string) => {
        setSessions(prev => {
            const session = prev.find(s => s.id === sessionId);
            if (session) {
                const updated = { ...session, endTime: new Date().toISOString() };
                void db.saveStudySession(updated);
                return prev.map(s => s.id === sessionId ? updated : s);
            }
            return prev;
        });
    };

    const recordCardResult = (sessionId: string, rating: CardRating) => {
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                cardsStudied: s.cardsStudied + 1,
                correctCount: s.correctCount + (rating === 'know' ? 1 : 0),
                somewhatCount: s.somewhatCount + (rating === 'somewhat' ? 1 : 0),
                wrongCount: s.wrongCount + (rating === 'still-learning' ? 1 : 0),
            };
        }));
    };

    // ========== DAILY STATS ==========

    const getTodayKey = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const updateDailyStats = async (rating: CardRating) => {
        const today = getTodayKey();

        setDailyStats(prev => {
            const existing = prev.find(d => d.date === today);
            let updatedStats: DailyStats[];
            if (existing) {
                updatedStats = prev.map(d => d.date === today ? {
                    ...d,
                    cardsStudied: d.cardsStudied + 1,
                    correctCount: d.correctCount + (rating === 'know' ? 1 : 0),
                    somewhatCount: d.somewhatCount + (rating === 'somewhat' ? 1 : 0),
                    wrongCount: d.wrongCount + (rating === 'still-learning' ? 1 : 0),
                } : d);
            } else {
                updatedStats = [...prev, {
                    date: today,
                    cardsStudied: 1,
                    timeSpentMinutes: 0, // Track separately if needed
                    correctCount: rating === 'know' ? 1 : 0,
                    somewhatCount: rating === 'somewhat' ? 1 : 0,
                    wrongCount: rating === 'still-learning' ? 1 : 0,
                }];
            }
            
            // Sync streak to DB whenever stats change
            const sortedDates = updatedStats
                .filter(d => d.cardsStudied > 0)
                .map(d => d.date)
                .sort((a, b) => b.localeCompare(a));
            
            // Compute streak
            let streakCount = 0;
            if (sortedDates.length > 0) {
                const now = new Date();
                const todayKey = today;
                
                const yesterdayDate = new Date();
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                const yKey = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
                
                if (sortedDates[0] === todayKey || sortedDates[0] === yKey) {
                    let checkDate = new Date(sortedDates[0] === todayKey ? now : yesterdayDate);
                    for (let i = 0; i < sortedDates.length; i++) {
                        const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
                        if (sortedDates.includes(key)) {
                            streakCount++;
                            checkDate.setDate(checkDate.getDate() - 1);
                        } else {
                            break;
                        }
                    }
                }
            }

            // Push to DB
            void db.getStreakInfo().then(info => {
                const data = info.streak_data || {};
                const daysStudied = data.daysStudied || [];
                if (!daysStudied.includes(today)) {
                    daysStudied.push(today);
                }
                void db.updateStreakInfo(streakCount, {
                    ...data,
                    daysStudied,
                    streakCount,
                    lastStudied: today
                });
            });

            return updatedStats;
        });
    };

    const getTodaysStats = (): DailyStats => {
        const today = getTodayKey();
        return dailyStats.find(d => d.date === today) || {
            date: today,
            cardsStudied: 0,
            timeSpentMinutes: 0,
            correctCount: 0,
            somewhatCount: 0,
            wrongCount: 0,
        };
    };

    const getWeeklyStats = (): DailyStats[] => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        // Reset time to ensure we compare dates accurately
        weekAgo.setHours(0, 0, 0, 0);

        return dailyStats.filter(d => {
            const dateParts = d.date.split('-');
            const statDate = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2])
            );
            return statDate >= weekAgo;
        });
    };

    const getStreak = (): number => {
        // Sort dates descending
        const sortedDays = dailyStats
            .filter(d => d.cardsStudied > 0)
            .map(d => d.date)
            .sort((a, b) => b.localeCompare(a));

        if (sortedDays.length === 0) return 0;

        const today = getTodayKey();

        // Calculate yesterday's key using local time
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yYear = yesterdayDate.getFullYear();
        const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
        const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
        const yesterdayKey = `${yYear}-${yMonth}-${yDay}`;

        // Must have studied today or yesterday to have a streak
        // If the latest study date isn't today OR yesterday, streak is broken
        if (sortedDays[0] !== today && sortedDays[0] !== yesterdayKey) {
            return 0;
        }

        let streak = 0;
        let checkDate = new Date();

        // If we haven't studied today yet but have yesterday, the streak assumes we WILL study today
        // But for calculation, we start checking from the latest study date
        const latestStudyDate = sortedDays[0];

        // If latest study was today, start checking from today
        // If latest study was yesterday, start checking from yesterday
        if (latestStudyDate === today) {
            // current checkDate is already today
        } else if (latestStudyDate === yesterdayKey) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Loop backwards
        for (let i = 0; i < sortedDays.length; i++) {
            const cYear = checkDate.getFullYear();
            const cMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
            const cDay = String(checkDate.getDate()).padStart(2, '0');
            const checkDateKey = `${cYear}-${cMonth}-${cDay}`;

            if (sortedDays.includes(checkDateKey)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); // Go to previous day
            } else {
                break; // Gap found
            }
        }

        return streak;
    };

    // ========== OVERALL STATS ==========

    const getTotalCardsStudied = (): number => {
        return dailyStats.reduce((sum, d) => sum + d.cardsStudied, 0);
    };

    const getTotalStudyTime = (): number => {
        return dailyStats.reduce((sum, d) => sum + d.timeSpentMinutes, 0);
    };

    // ========== CONTEXT VALUE ==========

    const value: StudyProgressContextType = {
        cardProgress,
        updateCardProgress,
        getCardProgress,
        resetCardProgress,
        resetDeckProgress,
        getDueCards,
        getNewCards,
        getLearningCards,
        getDeckStats,
        sessions,
        startSession,
        endSession,
        recordCardResult,
        dailyStats,
        getTodaysStats,
        getWeeklyStats,
        getStreak,
        getTotalCardsStudied,
        getTotalStudyTime,
    };

    return (
        <StudyProgressContext.Provider value={value}>
            {children}
        </StudyProgressContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useStudyProgress() {
    const context = useContext(StudyProgressContext);
    if (context === undefined) {
        throw new Error('useStudyProgress must be used within a StudyProgressProvider');
    }
    return context;
}
