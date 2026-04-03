export type QuestionType = 'multiple-choice' | 'written' | 'true-false';

export type LearnGoal = 'study' | 'learn';

export interface TeachingContent {
    headline: string;
    keyTerms: { term: string; definition: string; }[];
    comparison?: { type: string; description: string; }[] | null;
    breakdown: { point: string; description: string; }[];
    realWorldExamples: string[];
    importance: string;
    eli5?: string;
    detailed?: string;
}

export interface LearnCard {
    id: number;
    term: string;
    definition: string;
    starred?: boolean;
    // Mastery tracking
    mastery: 0 | 1 | 2; // 0 = not learned, 1 = familiar, 2 = mastered
    attemptCount: number;
    correctCount: number;
    lastAttemptCorrect?: boolean;
    // Teaching content (for when they get it wrong)
    teachingContent?: TeachingContent;
}

export interface LearnModeState {
    goal: LearnGoal;
    queue: LearnCard[]; // Cards left to answer
    completed: LearnCard[]; // Cards answered correctly
    requeue: LearnCard[]; // Cards to retry (wrong answers)
    currentCard: LearnCard | null;
    totalCards: number;
    isComplete: boolean;
}

export interface LearnModeSettings {
    autoPlayAudio: boolean;
    explanationStyle: 'eli5' | 'detailed';
    testMode: boolean; // Use mock data if true
}

export interface SessionStats {
    totalQuestions: number;
    correctFirst: number; // Correct on first try
    masteredThisSession: number;
    timeTaken: number; // in seconds
}
