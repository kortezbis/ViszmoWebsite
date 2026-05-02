import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    type LearnCard,
    type LearnModeSettings,
    type LearnGoal,
    type SessionStats,
    type TeachingContent
} from './types';
import { CompletionScreen } from './CompletionScreen';
import { generateTeachingContent } from './utils/aiExplanations';
import { gradeWrittenAnswer } from './utils/lcsGrading';
import { CheckCircle2, XCircle, Volume2, Square, Lightbulb, BookOpen, Sparkles, Mic } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type LearnQuestionType = 'mcq' | 'true-false' | 'case-study' | 'speaking';
type StudyQuestionType = 'written' | 'fill-blank' | 'mcq' | 'speaking';
type StudyPhase = 'teaching' | 'practice' | 'quiz';

// ============================================
// PROPS
// ============================================

interface LearnModeProps {
    cards: Array<{ term: string; definition: string; id: number; starred?: boolean }>;
    settings: LearnModeSettings;
    deckId?: string;
    onComplete: (results: LearnCard[]) => void;
    onExit: () => void;
}

// ============================================
// GOAL SELECTION
// ============================================

function GoalSelection({ onSelect }: { onSelect: (goal: LearnGoal) => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1.5">
                    Choose a goal
                </h2>
                <p className="text-sm text-foreground-secondary leading-relaxed mb-6">
                    Pick how you want to run this session.
                </p>

                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => onSelect('study')}
                        className="w-full p-4 sm:p-5 rounded-xl border border-brand-primary/40 bg-brand-primary/5 text-left transition-all hover:bg-brand-primary/10 hover:border-brand-primary/60"
                    >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-base font-semibold text-foreground">Deep study</span>
                            <Sparkles className="w-5 h-5 text-brand-primary shrink-0" />
                        </div>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            AI explanations, typing, fill-in-the-blank, and short quizzes.
                        </p>
                    </button>

                    <button
                        onClick={() => onSelect('learn')}
                        className="w-full p-4 sm:p-5 rounded-xl border border-border bg-surface text-left transition-all hover:border-brand-primary/35 hover:bg-surface-hover"
                    >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-base font-semibold text-foreground">Quick practice</span>
                            <BookOpen className="w-5 h-5 text-foreground-muted shrink-0" />
                        </div>
                        <p className="text-sm text-foreground-secondary leading-relaxed">
                            MCQ, true/false, and drills until you clear the deck.
                        </p>
                    </button>
                </div>

                <p className="text-xs text-foreground-muted text-center">
                    Tap a card above to start — no extra step required.
                </p>
            </motion.div>
        </div>
    );
}

// ============================================
// STUDY MODE COMPONENTS
// ============================================

// Teaching Card (AI-generated content)
interface TeachingCardProps {
    card: LearnCard;
    content: TeachingContent | null;
    isLoading: boolean;
    onContinue: () => void;
}

function TeachingCard({ card, content, isLoading, onContinue }: TeachingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-brand-primary/10 border-b border-brand-primary/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2.5">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary shrink-0" />
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Teaching</span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-8">
                    {/* Term & Definition */}
                    <div className="mb-6 sm:mb-8 text-center space-y-3">
                        <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">{card.term}</p>
                        <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed max-w-prose mx-auto">{card.definition}</p>
                    </div>

                    {/* AI Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-foreground-secondary">Generating explanation…</span>
                        </div>
                    ) : content ? (
                        <div className="space-y-3 sm:space-y-4">
                            {content.eli5 && (
                                <div className="bg-surface/60 rounded-xl p-4 sm:p-5 border border-border/60 transition-colors hover:border-brand-primary/25">
                                    <p className="text-xs font-semibold text-brand-primary mb-2">Simple explanation</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.eli5}</p>
                                </div>
                            )}

                            {content.realWorldExamples && content.realWorldExamples.length > 0 && (
                                <div className="bg-surface/60 rounded-xl p-4 sm:p-5 border border-border/60 transition-colors hover:border-brand-primary/25">
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">Real-world example</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.realWorldExamples[0]}</p>
                                </div>
                            )}

                            {content.importance && (
                                <div className="bg-surface/60 rounded-xl p-4 sm:p-5 border border-border/60 transition-colors hover:border-brand-primary/25">
                                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Why it matters</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.importance}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-border bg-surface/25">
                    <button
                        onClick={onContinue}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-brand-primary text-black font-semibold text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        Continue to practice
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Written Answer Question
interface WrittenQuestionProps {
    card: LearnCard;
    onAnswer: (correct: boolean) => void;
    onSkip: () => void;
}

function WrittenQuestion({ card, onAnswer, onSkip }: WrittenQuestionProps) {
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = () => {
        if (!userAnswer.trim()) return;

        const grading = gradeWrittenAnswer(userAnswer, card.definition);
        setIsCorrect(grading.isCorrect);

        if (grading.isCorrect) {
            onAnswer(true);
        } else {
            setShowResult(true);
        }
    };

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && !isCorrect) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, isCorrect, onAnswer]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8">
                <div className="mb-5">
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Written answer</span>
                </div>

                <p className="text-sm text-foreground-secondary mb-1 text-center">Define or explain:</p>
                <p className="text-lg sm:text-xl font-bold text-foreground mb-5 sm:mb-6 text-center tracking-tight leading-snug">{card.term}</p>

                <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult}
                    placeholder="Type your answer..."
                    className="w-full p-3.5 sm:p-4 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted/70 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors text-sm leading-relaxed min-h-[100px]"
                    rows={4}
                    autoFocus
                />

                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                                <XCircle className="w-5 h-5 text-error" />
                            )}
                            <span className={`font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                                {isCorrect ? 'Correct!' : 'Not quite'}
                            </span>
                        </div>
                        {!isCorrect && (
                            <p className="text-foreground-muted text-sm">
                                <span className="font-medium">Correct answer:</span> {card.definition}
                            </p>
                        )}
                    </motion.div>
                )}

                {!showResult ? (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={onSkip}
                            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm px-4 py-2 rounded-lg hover:bg-surface-hover"
                        >
                            <Square className="w-3 h-3" />
                            Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!userAnswer.trim()}
                            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-brand-primary text-black font-semibold text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                            Check answer
                        </button>
                    </div>
                ) : !isCorrect && (
                    <div className="flex flex-col items-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border gap-3 text-center px-2">
                        <p className="text-sm text-foreground-secondary">Press any key or tap continue to move on.</p>
                        <button
                            onClick={() => onAnswer(false)}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-95 active:scale-[0.99] transition-all"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Fill-in-the-Blank Question
interface FillBlankQuestionProps {
    card: LearnCard;
    onAnswer: (correct: boolean) => void;
    onSkip: () => void;
}

function FillBlankQuestion({ card, onAnswer, onSkip }: FillBlankQuestionProps) {
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [sentence, setSentence] = useState('');
    const [blankWord, setBlankWord] = useState('');

    useEffect(() => {
        // Create a fill-in-blank from the definition
        const words = card.definition.split(' ');
        if (words.length >= 3) {
            // Pick a key word to blank out (prefer longer words)
            const candidates = words.filter(w => w.length > 4);
            const wordToBlank = candidates.length > 0
                ? candidates[Math.floor(Math.random() * candidates.length)]
                : words[Math.floor(words.length / 2)];

            setBlankWord(wordToBlank.replace(/[.,!?;:]/g, ''));
            setSentence(card.definition.replace(wordToBlank, '______'));
        } else {
            // Fallback: blank the term itself
            setBlankWord(card.term);
            setSentence(`The definition of ______ is: ${card.definition}`);
        }
        setUserAnswer('');
        setShowResult(false);
    }, [card.id]);

    const handleSubmit = () => {
        if (!userAnswer.trim()) return;

        const normalized = userAnswer.toLowerCase().trim();
        const target = blankWord.toLowerCase().trim();
        const correct = normalized === target || normalized.includes(target) || target.includes(normalized);

        setIsCorrect(correct);
        if (correct) {
            onAnswer(true);
        } else {
            setShowResult(true);
        }
    };

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && !isCorrect) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, isCorrect, onAnswer]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8">
                <div className="mb-5">
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Fill in the blank</span>
                </div>

                <p className="text-sm text-foreground-secondary mb-1 text-center">Complete the sentence for:</p>
                <p className="text-lg sm:text-xl font-bold text-foreground mb-5 sm:mb-6 text-center tracking-tight">{card.term}</p>

                <div className="bg-surface/60 rounded-xl p-4 sm:p-6 border border-border mb-5">
                    <p className="text-base sm:text-lg text-foreground leading-relaxed text-center">{sentence}</p>
                </div>

                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult}
                    placeholder="Missing word…"
                    className="w-full p-3.5 sm:p-4 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors text-sm sm:text-base"
                    autoFocus
                />

                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}
                    >
                        <div className="flex items-center gap-2">
                            {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                                <XCircle className="w-5 h-5 text-error" />
                            )}
                            <span className={`font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                                {isCorrect ? 'Correct!' : `The answer was: ${blankWord}`}
                            </span>
                        </div>
                    </motion.div>
                )}

                {!showResult ? (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={onSkip}
                            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm px-4 py-2 rounded-lg hover:bg-surface-hover"
                        >
                            <Square className="w-3 h-3" />
                            Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!userAnswer.trim()}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-brand-primary text-black font-semibold text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                            Check
                        </button>
                    </div>
                ) : !isCorrect && (
                    <div className="flex flex-col items-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border gap-3 text-center px-2">
                        <p className="text-sm text-foreground-secondary">Press any key or tap continue to move on.</p>
                        <button
                            onClick={() => onAnswer(false)}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-95 active:scale-[0.99] transition-all"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Speaking Question (5 second max)
interface SpeakingQuestionProps {
    card: LearnCard;
    onAnswer: (correct: boolean) => void;
    onSkip: () => void;
}

function SpeakingQuestion({ card, onAnswer, onSkip }: SpeakingQuestionProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<any>(null);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const checkAnswer = useCallback((spoken: string) => {
        const normalized = spoken.toLowerCase().trim();
        const target = card.definition.toLowerCase().trim();
        const spokenWords = normalized.split(/\s+/);
        const targetWords = target.split(/\s+/);
        const matchCount = spokenWords.filter(w => targetWords.includes(w)).length;
        const correct = matchCount / targetWords.length >= 0.4;

        setIsCorrect(correct);
        if (correct) {
            onAnswer(true);
        } else {
            setShowResult(true);
            stopRecording();
        }
    }, [card.definition, onAnswer, stopRecording]);

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && !isCorrect) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, isCorrect, onAnswer]);

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            onSkip();
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            setTranscript(result);
        };

        recognitionRef.current.onerror = () => stopRecording();
        recognitionRef.current.onend = () => {
            if (isRecording && transcript) {
                checkAnswer(transcript);
            }
        };

        recognitionRef.current.start();
        setIsRecording(true);
        setTimeLeft(5);

        // 5 second timer
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopRecording();
                    if (transcript) {
                        checkAnswer(transcript);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
            if (transcript) {
                checkAnswer(transcript);
            }
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                    <Mic className="w-4 h-4 text-brand-primary shrink-0" />
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Speaking</span>
                </div>

                <p className="text-sm text-foreground-secondary mb-1 text-center">Say the definition for:</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center tracking-tight leading-snug">{card.term}</p>

                <div className="flex flex-col items-center gap-4">
                    {!showResult ? (
                        <>
                            <button
                                onClick={toggleRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-error animate-pulse' : 'bg-brand-primary hover:bg-brand-primary/90'
                                    }`}
                            >
                                {isRecording ? (
                                    <Square className="w-8 h-8 text-white" />
                                ) : (
                                    <Mic className="w-10 h-10 text-white" />
                                )}
                            </button>
                            <p className="text-sm text-foreground-muted">
                                {isRecording ? `Recording... ${timeLeft}s` : 'Tap to speak'}
                            </p>
                        </>
                    ) : (
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCorrect ? 'bg-success' : 'bg-error'}`}>
                            {isCorrect ? <CheckCircle2 className="w-8 h-8 text-white" /> : <XCircle className="w-8 h-8 text-white" />}
                        </div>
                    )}

                    {transcript && (
                        <div className="mt-4 p-4 bg-surface rounded-xl w-full">
                            <p className="text-xs text-foreground-muted mb-1">You said:</p>
                            <p className="text-foreground">{transcript}</p>
                        </div>
                    )}

                    {showResult && !isCorrect && (
                        <div className="p-4 bg-success/10 border border-success/30 rounded-xl w-full">
                            <p className="text-xs text-success mb-1">Correct answer:</p>
                            <p className="text-success">{card.definition}</p>
                        </div>
                    )}
                </div>
            </div>

            {!showResult && !isRecording && (
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onSkip}
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm px-4 py-2"
                    >
                        <Square className="w-3 h-3" />
                        Skip
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// MCQ for Mini Quiz
interface MCQQuestionProps {
    card: LearnCard;
    allCards: LearnCard[];
    onAnswer: (correct: boolean) => void;
    onSkip: () => void;
}

function MCQQuestion({ card, allCards, onAnswer, onSkip }: MCQQuestionProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const correctAnswer = card.definition;
        const otherCards = allCards.filter(c => c.id !== card.id);
        const shuffled = [...otherCards].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffled.slice(0, 3).map(c => c.definition);
        const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setSelectedOption(null);
        setShowResult(false);
    }, [card.id]);

    const handleSelect = (index: number) => {
        if (showResult) {
            if (index === correctIndex) onAnswer(false);
            return;
        }
        setSelectedOption(index);
        const isCorrect = options[index] === card.definition;
        if (isCorrect) {
            onAnswer(true);
        } else {
            setShowResult(true);
        }
    };

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && options[selectedOption!] !== card.definition) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, selectedOption, options, card.definition, onAnswer]);

    const correctIndex = options.findIndex(o => o === card.definition);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8">
                <div className="mb-5">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Checkpoint quiz</span>
                </div>

                <p className="text-lg sm:text-xl font-bold text-foreground mb-6 sm:mb-8 text-center tracking-tight leading-snug">{card.term}</p>

                <div className="space-y-2.5 sm:space-y-3">
                    {options.map((option, index) => {
                        let bgClass = 'bg-surface border-border hover:border-brand-primary/45';

                        if (showResult) {
                            if (index === correctIndex) bgClass = 'bg-success/15 border-success/60';
                            else if (index === selectedOption) bgClass = 'bg-error/15 border-error/60';
                        } else if (selectedOption === index) {
                            bgClass = 'bg-brand-primary/15 border-brand-primary';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${bgClass}`}
                            >
                                <span className="w-7 h-7 rounded-lg bg-surface-active flex items-center justify-center text-xs font-semibold text-foreground-muted shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-sm text-foreground leading-relaxed pt-0.5">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && options[selectedOption!] !== card.definition && (
                <div className="flex flex-col items-center mt-6 sm:mt-8 gap-3 text-center px-2">
                    <p className="text-sm text-foreground-secondary">Choose the correct option or press any key to continue.</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-95 active:scale-[0.99] transition-all"
                    >
                        Continue
                    </button>
                </div>
            )}

            <div className="flex justify-end mt-4">
                <button
                    onClick={onSkip}
                    disabled={showResult}
                    className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm px-4 py-2"
                >
                    <Square className="w-3 h-3" />
                    Skip
                </button>
            </div>
        </motion.div>
    );
}

// ============================================
// LEARN ALL CARDS MODE COMPONENTS (Quick Practice)
// ============================================

function LearnMCQQuestion({ card, allCards, onAnswer, onSkip }: MCQQuestionProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const correctAnswer = card.definition;
        const otherCards = allCards.filter(c => c.id !== card.id);
        const shuffled = [...otherCards].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffled.slice(0, 3).map(c => c.definition);
        const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setSelectedOption(null);
        setShowResult(false);
    }, [card.id]);

    const handleSelect = (index: number) => {
        if (showResult) {
            if (index === correctIndex) onAnswer(false);
            return;
        }
        setSelectedOption(index);
        const isCorrect = options[index] === card.definition;
        if (isCorrect) {
            onAnswer(true);
        } else {
            setShowResult(true);
        }
    };

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && options[selectedOption!] !== card.definition) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, selectedOption, options, card.definition, onAnswer]);

    const correctIndex = options.findIndex(o => o === card.definition);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-3xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8 mb-3 sm:mb-4">
                <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Multiple choice</span>
                    <button type="button" className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors" aria-label="Audio (coming soon)">
                        <Volume2 className="w-4 h-4 text-foreground-muted" />
                    </button>
                </div>

                <p className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-6 sm:mb-8 text-center tracking-tight max-w-prose mx-auto">{card.term}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {options.map((option, index) => {
                        let bgClass = 'bg-surface border-border hover:border-brand-primary/40';

                        if (showResult) {
                            if (index === correctIndex) bgClass = 'bg-success/10 border-success/55';
                            else if (index === selectedOption) bgClass = 'bg-error/10 border-error/55';
                        } else if (selectedOption === index) {
                            bgClass = 'bg-brand-primary/10 border-brand-primary';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 sm:gap-4 ${bgClass} group`}
                            >
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 transition-colors ${showResult && index === correctIndex ? 'bg-success text-white' : 'bg-surface-active text-foreground-muted'}`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-sm text-foreground leading-relaxed pt-1">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && options[selectedOption!] !== card.definition && (
                <div className="flex flex-col items-center mt-6 sm:mt-8 gap-3 text-center px-2">
                    <p className="text-sm text-foreground-secondary">Choose the correct option or press any key to continue.</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-95 active:scale-[0.99] transition-all"
                    >
                        Continue
                    </button>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={onSkip}
                    disabled={showResult}
                    className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm px-4 py-2 rounded-lg hover:bg-surface-hover"
                >
                    <Square className="w-3 h-3" />
                    Can't answer now
                </button>
            </div>
        </motion.div>
    );
}

function TrueFalseQuestion({ card, allCards, onAnswer, onSkip }: { card: LearnCard; allCards: LearnCard[]; onAnswer: (correct: boolean) => void; onSkip: () => void }) {
    const [selected, setSelected] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isStatementTrue, setIsStatementTrue] = useState(true);
    const [displayedDefinition, setDisplayedDefinition] = useState('');

    useEffect(() => {
        const shouldBeTrue = Math.random() > 0.5;
        setIsStatementTrue(shouldBeTrue);

        if (shouldBeTrue) {
            setDisplayedDefinition(card.definition);
        } else {
            const otherCards = allCards.filter(c => c.id !== card.id);
            if (otherCards.length > 0) {
                const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
                setDisplayedDefinition(randomCard.definition);
            } else {
                setDisplayedDefinition(card.definition);
                setIsStatementTrue(true);
            }
        }
        setSelected(null);
        setShowResult(false);
    }, [card.id]);

    const handleSelect = (answer: boolean) => {
        if (showResult) {
            if (answer === isStatementTrue) onAnswer(false);
            return;
        }
        setSelected(answer);
        const correct = answer === isStatementTrue;
        if (correct) {
            onAnswer(true);
        } else {
            setShowResult(true);
        }
    };

    useEffect(() => {
        const handleKeyPress = () => {
            if (showResult && selected !== isStatementTrue) {
                onAnswer(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResult, selected, isStatementTrue, onAnswer]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl sm:max-w-2xl mx-auto"
        >
            <div className="bg-background-card border border-border rounded-2xl p-5 sm:p-8 mb-3 sm:mb-4">
                <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">True or false</span>

                <p className="text-sm text-foreground-secondary mt-4 mb-3 leading-relaxed">
                    For <span className="font-semibold text-foreground">{card.term}</span>, is this statement correct?
                </p>

                <div className="bg-surface rounded-xl p-4 sm:p-6 mb-5 sm:mb-6 border border-border">
                    <p className="text-foreground text-base sm:text-lg leading-relaxed">&ldquo;{displayedDefinition}&rdquo;</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[true, false].map((val) => {
                        const isCorrectChoice = val === isStatementTrue;
                        let bgClass = 'bg-surface border-border hover:border-brand-primary/40';

                        if (showResult) {
                            if (isCorrectChoice) bgClass = 'bg-success/10 border-success/55';
                            else if (selected === val) bgClass = 'bg-error/10 border-error/55';
                        } else if (selected === val) {
                            bgClass = 'bg-brand-primary/10 border-brand-primary';
                        }

                        return (
                            <button
                                key={String(val)}
                                onClick={() => handleSelect(val)}
                                className={`p-4 sm:p-5 rounded-xl border-2 text-center font-semibold text-base sm:text-lg transition-all ${bgClass} text-foreground flex flex-col items-center gap-1.5`}
                            >
                                <span className="text-xl sm:text-2xl" aria-hidden>{val ? '✓' : '✗'}</span>
                                <span className="text-xs uppercase tracking-wide text-foreground-secondary">{val ? 'True' : 'False'}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && selected !== isStatementTrue && (
                <div className="flex flex-col items-center mt-6 sm:mt-8 gap-3 text-center px-2">
                    <p className="text-sm text-foreground-secondary">Tap the correct answer or press any key to continue.</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-95 active:scale-[0.99] transition-all"
                    >
                        Continue
                    </button>
                </div>
            )}

            <div className="flex justify-end">
                <button onClick={onSkip} disabled={showResult} className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm px-4 py-2">
                    <Square className="w-3 h-3" /> Can't answer now
                </button>
            </div>
        </motion.div>
    );
}

// ============================================
// MAIN LEARN MODE
// ============================================

export function LearnMode({ cards, settings, onComplete, onExit }: LearnModeProps) {
    const [goal, setGoal] = useState<LearnGoal | null>(null);

    // Study Mode State
    const [studyQueue, setStudyQueue] = useState<LearnCard[]>([]);
    const [studyPhase, setStudyPhase] = useState<StudyPhase>('teaching');
    const [studyQuestionType, setStudyQuestionType] = useState<StudyQuestionType>('written');
    const [teachingContent, setTeachingContent] = useState<TeachingContent | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [cardsLearnedThisRound, setCardsLearnedThisRound] = useState(0);

    // Learn Mode State
    const [learnQueue, setLearnQueue] = useState<LearnCard[]>([]);
    const [learnQuestionType, setLearnQuestionType] = useState<LearnQuestionType>('mcq');

    // Shared State
    const [currentCard, setCurrentCard] = useState<LearnCard | null>(null);
    const [mastered, setMastered] = useState<LearnCard[]>([]);
    const [skipped, setSkipped] = useState<LearnCard[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [missedCardCounts, setMissedCardCounts] = useState<Record<number, string>>({});
    const [stats, setStats] = useState<SessionStats>({ totalQuestions: 0, correctFirst: 0, masteredThisSession: 0, timeTaken: 0 });
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (isComplete && onComplete) {
            onComplete(mastered);
        }
    }, [isComplete, mastered, onComplete]);

    // Initialize based on goal
    useEffect(() => {
        if (!goal) return;

        const learnCards: LearnCard[] = cards.map(c => ({
            ...c,
            mastery: 0 as const,
            attemptCount: 0,
            correctCount: 0
        }));

        const shuffled = [...learnCards].sort(() => Math.random() - 0.5);

        if (goal === 'study') {
            setStudyQueue(shuffled);
            setCurrentCard(shuffled[0] || null);
            setStudyPhase('teaching');
            loadTeachingContent(shuffled[0]);
        } else {
            setLearnQueue(shuffled);
            setCurrentCard(shuffled[0] || null);
            pickLearnQuestionType();
        }
    }, [goal, cards]);

    // Load AI teaching content
    const loadTeachingContent = async (card: LearnCard) => {
        if (!card) return;
        setIsLoadingContent(true);
        try {
            const content = await generateTeachingContent(card, settings.testMode);
            setTeachingContent(content);
        } catch {
            setTeachingContent(null);
        }
        setIsLoadingContent(false);
    };

    const pickLearnQuestionType = () => {
        const rand = Math.random();
        if (rand < 0.6) setLearnQuestionType('mcq');
        else if (rand < 0.85) setLearnQuestionType('true-false');
        else setLearnQuestionType('case-study');
    };

    const pickStudyQuestionType = () => {
        // Balanced: 35% MCQ, 25% Written, 25% Fill-in-blank, 15% Speaking
        const rand = Math.random();
        if (rand < 0.35) setStudyQuestionType('mcq');
        else if (rand < 0.6) setStudyQuestionType('written');
        else if (rand < 0.85) setStudyQuestionType('fill-blank');
        else setStudyQuestionType('speaking');
    };

    // Study Mode: Handle teaching continue
    const handleTeachingContinue = () => {
        setStudyPhase('practice');
        pickStudyQuestionType();
    };

    // Study Mode: Handle practice answer
    const handleStudyAnswer = useCallback((correct: boolean) => {
        if (!currentCard) return;

        const updatedCard: LearnCard = {
            ...currentCard,
            attemptCount: currentCard.attemptCount + 1,
            correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
            mastery: correct ? (Math.min(currentCard.mastery + 1, 2) as 0 | 1 | 2) : 0 as const
        };

        if (!correct) {
            setMissedCardCounts(prev => ({
                ...prev,
                [currentCard.id]: currentCard.term
            }));
        }

        setQuestionsAnswered(prev => prev + 1);
        setStats(prev => ({
            ...prev,
            totalQuestions: prev.totalQuestions + 1,
            correctFirst: currentCard.attemptCount === 0 && correct ? prev.correctFirst + 1 : prev.correctFirst
        }));

        const newQueue = studyQueue.slice(1);
        const newCardsLearned = cardsLearnedThisRound + 1;

        if (correct && updatedCard.mastery >= 2) {
            setMastered(prev => [...prev, updatedCard]);
            setStats(prev => ({ ...prev, masteredThisSession: prev.masteredThisSession + 1 }));
        } else {
            newQueue.push(updatedCard);
        }

        setStudyQueue(newQueue);
        setCardsLearnedThisRound(newCardsLearned);

        if (newCardsLearned >= 4 && newQueue.length > 0) {
            setStudyPhase('quiz');
            setCardsLearnedThisRound(0);
        } else if (newQueue.length === 0) {
            setIsComplete(true);
            setStats(prev => ({ ...prev, timeTaken: Math.floor((Date.now() - startTime) / 1000) }));
        } else {
            setCurrentCard(newQueue[0]);
            setStudyPhase('teaching');
            loadTeachingContent(newQueue[0]);
        }
    }, [currentCard, studyQueue, cardsLearnedThisRound, startTime]);

    // Study Mode: Handle quiz answer
    const handleQuizAnswer = useCallback((_correct: boolean) => {
        setQuestionsAnswered(prev => prev + 1);

        if (studyQueue.length === 0) {
            setIsComplete(true);
            setStats(prev => ({ ...prev, timeTaken: Math.floor((Date.now() - startTime) / 1000) }));
        } else {
            setCurrentCard(studyQueue[0]);
            setStudyPhase('teaching');
            loadTeachingContent(studyQueue[0]);
        }
    }, [studyQueue, startTime]);

    // Learn Mode: Handle answer
    const handleLearnAnswer = useCallback((correct: boolean) => {
        if (!currentCard) return;

        const updatedCard: LearnCard = {
            ...currentCard,
            attemptCount: currentCard.attemptCount + 1,
            correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
            mastery: correct ? (Math.min(currentCard.mastery + 1, 2) as 0 | 1 | 2) : 0 as const
        };

        if (!correct) {
            setMissedCardCounts(prev => ({
                ...prev,
                [currentCard.id]: currentCard.term
            }));
        }

        setQuestionsAnswered(prev => prev + 1);
        setStats(prev => ({
            ...prev,
            totalQuestions: prev.totalQuestions + 1,
            correctFirst: currentCard.attemptCount === 0 && correct ? prev.correctFirst + 1 : prev.correctFirst
        }));

        const newQueue = learnQueue.slice(1);

        if (correct && updatedCard.mastery >= 2) {
            setMastered(prev => [...prev, updatedCard]);
            setStats(prev => ({ ...prev, masteredThisSession: prev.masteredThisSession + 1 }));
        } else {
            newQueue.push(updatedCard);
        }

        setLearnQueue(newQueue);

        if (newQueue.length === 0) {
            setIsComplete(true);
            setStats(prev => ({ ...prev, timeTaken: Math.floor((Date.now() - startTime) / 1000) }));
        } else {
            setCurrentCard(newQueue[0]);
            pickLearnQuestionType();
        }
    }, [currentCard, learnQueue, startTime]);

    // Handle skip
    const handleSkip = useCallback(() => {
        if (!currentCard) return;
        setSkipped(prev => [...prev, currentCard]);

        if (goal === 'study') {
            const newQueue = studyQueue.slice(1);
            setStudyQueue(newQueue);
            if (newQueue.length === 0) {
                setIsComplete(true);
            } else {
                setCurrentCard(newQueue[0]);
                setStudyPhase('teaching');
                loadTeachingContent(newQueue[0]);
            }
        } else {
            const newQueue = learnQueue.slice(1);
            setLearnQueue(newQueue);
            if (newQueue.length === 0) {
                setIsComplete(true);
            } else {
                setCurrentCard(newQueue[0]);
                pickLearnQuestionType();
            }
        }
    }, [currentCard, goal, studyQueue, learnQueue]);

    // ============================================
    // RENDER
    // ============================================

    if (!goal) return <GoalSelection onSelect={setGoal} />;

    if (isComplete) {
        return (
            <CompletionScreen
                masteredCards={mastered}
                missedCards={skipped}
                totalCards={cards.length}
                onRestart={() => {
                    setGoal(null);
                    setStudyQueue([]);
                    setLearnQueue([]);
                    setMastered([]);
                    setSkipped([]);
                    setCurrentCard(null);
                    setIsComplete(false);
                    setQuestionsAnswered(0);
                    setStats({ totalQuestions: 0, correctFirst: 0, masteredThisSession: 0, timeTaken: 0 });
                }}
                onBackToDashboard={onExit}
            />
        );
    }

    const totalCards = goal === 'study'
        ? studyQueue.length + mastered.length + skipped.length
        : learnQueue.length + mastered.length + skipped.length;

    return (
        <div className="flex-1 flex flex-col min-h-0 h-full bg-background relative overflow-hidden">
            {/* Progress */}
            <div className="shrink-0 px-4 sm:px-8 lg:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5 bg-surface/5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full max-w-3xl mx-auto">
                    <div>
                        <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-1">Progress</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{mastered.length}</span>
                            <span className="text-sm text-foreground-secondary">/ {totalCards} mastered</span>
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide block mb-1">First-try accuracy</span>
                        <span className="text-2xl sm:text-3xl font-bold text-brand-primary tabular-nums">
                            {stats.correctFirst > 0 ? Math.round((stats.correctFirst / stats.totalQuestions) * 100) : stats.totalQuestions === 0 ? '—' : 100}%
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-3xl mx-auto">
                    <div className="flex justify-between text-xs text-foreground-muted mb-1.5 px-0.5">
                        <span>0</span>
                        <span>{totalCards} cards</span>
                    </div>
                    <div className="h-2.5 sm:h-3 bg-surface/40 rounded-full overflow-hidden border border-border/30">
                        <motion.div
                            className="h-full bg-brand-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalCards > 0 ? Math.min(100, (mastered.length / totalCards) * 100) : 0}%` }}
                            transition={{ duration: 0.45, ease: 'circOut' }}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-3 w-full max-w-3xl mx-auto pt-1">
                    {Object.keys(missedCardCounts).length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-error/5 border border-error/20 rounded-xl text-left sm:text-center justify-center sm:justify-start">
                            <span className="text-xs font-semibold text-error shrink-0">Needs work</span>
                            <span className="text-sm text-foreground truncate">{Object.values(missedCardCounts).pop()}</span>
                        </div>
                    )}
                    {mastered.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-success/5 border border-success/20 rounded-xl text-left sm:text-center justify-center sm:justify-start">
                            <span className="text-xs font-semibold text-success shrink-0">Last mastered</span>
                            <span className="text-sm text-foreground truncate">{mastered[mastered.length - 1].term}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait">
                    {/* STUDY MODE */}
                    {goal === 'study' && currentCard && (
                        <>
                            {studyPhase === 'teaching' && (
                                <TeachingCard
                                    key={`teach-${currentCard.id}`}
                                    card={currentCard}
                                    content={teachingContent}
                                    isLoading={isLoadingContent}
                                    onContinue={handleTeachingContinue}
                                />
                            )}
                            {studyPhase === 'practice' && studyQuestionType === 'written' && (
                                <WrittenQuestion
                                    key={`written-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    onAnswer={handleStudyAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {studyPhase === 'practice' && studyQuestionType === 'fill-blank' && (
                                <FillBlankQuestion
                                    key={`fill-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    onAnswer={handleStudyAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {studyPhase === 'practice' && studyQuestionType === 'mcq' && (
                                <MCQQuestion
                                    key={`mcq-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    allCards={[...studyQueue, ...mastered]}
                                    onAnswer={handleStudyAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {studyPhase === 'practice' && studyQuestionType === 'speaking' && (
                                <SpeakingQuestion
                                    key={`speak-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    onAnswer={handleStudyAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {studyPhase === 'quiz' && (
                                <MCQQuestion
                                    key={`quiz-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    allCards={[...studyQueue, ...mastered]}
                                    onAnswer={handleQuizAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                        </>
                    )}

                    {/* LEARN MODE */}
                    {goal === 'learn' && currentCard && (
                        <>
                            {learnQuestionType === 'mcq' && (
                                <LearnMCQQuestion
                                    key={`mcq-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    allCards={[...learnQueue, ...mastered]}
                                    onAnswer={handleLearnAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {learnQuestionType === 'true-false' && (
                                <TrueFalseQuestion
                                    key={`tf-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    allCards={[...learnQueue, ...mastered]}
                                    onAnswer={handleLearnAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                            {learnQuestionType === 'case-study' && (
                                <LearnMCQQuestion
                                    key={`case-${currentCard.id}-${questionsAnswered}`}
                                    card={currentCard}
                                    allCards={[...learnQueue, ...mastered]}
                                    onAnswer={handleLearnAnswer}
                                    onSkip={handleSkip}
                                />
                            )}
                        </>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
