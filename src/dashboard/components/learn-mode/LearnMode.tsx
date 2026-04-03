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
        <div className="flex flex-col items-center justify-center h-full p-8 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background-card border border-border rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-foreground mb-2">Choose a goal for this session</h2>
                <p className="text-foreground-muted mb-6">How do you want to learn today?</p>

                <div className="space-y-4 mb-6">
                    <button
                        onClick={() => onSelect('study')}
                        className="w-full p-5 rounded-2xl border-2 border-brand-primary bg-brand-primary/10 text-left transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-foreground">Study</span>
                            <Sparkles className="w-6 h-6 text-brand-primary" />
                        </div>
                        <p className="text-sm text-foreground-muted">
                            AI-powered deep learning. Teaching, typing, fill-in-blank, and mini quizzes.
                        </p>
                    </button>

                    <button
                        onClick={() => onSelect('learn')}
                        className="w-full p-5 rounded-2xl border-2 border-border hover:border-brand-primary bg-surface text-left transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-foreground">Learn All Cards</span>
                            <BookOpen className="w-6 h-6 text-foreground-muted" />
                        </div>
                        <p className="text-sm text-foreground-muted">
                            Quick practice. MCQ, True/False, and more until you master all cards.
                        </p>
                    </button>
                </div>

                <button
                    onClick={() => onSelect('study')}
                    className="w-full py-4 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors"
                >
                    Start Learning →
                </button>
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
            className="w-full max-w-3xl"
        >
            <div className="bg-background-card border border-border rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="bg-brand-primary/10 border-b border-brand-primary/20 px-6 py-4 flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-brand-primary" />
                    <span className="text-xs font-black text-brand-primary uppercase tracking-wider">Teaching Mode</span>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Term & Definition */}
                    <div className="mb-8 text-center">
                        <p className="text-xl font-black text-foreground mb-3">{card.term}</p>
                        <p className="text-base text-foreground-secondary leading-relaxed">{card.definition}</p>
                    </div>

                    {/* AI Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium text-foreground-muted">AI is explaining...</span>
                        </div>
                    ) : content ? (
                        <div className="space-y-4">
                            {content.eli5 && (
                                <div className="bg-surface/50 rounded-2xl p-5 border border-border/50 group hover:border-brand-primary/30 transition-colors">
                                    <p className="text-[10px] font-black text-brand-primary uppercase mb-2 tracking-[0.2em]">💡 Simple Explanation</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.eli5}</p>
                                </div>
                            )}

                            {content.realWorldExamples && content.realWorldExamples.length > 0 && (
                                <div className="bg-surface/50 rounded-2xl p-5 border border-border/50 group hover:border-brand-primary/30 transition-colors">
                                    <p className="text-[10px] font-black text-warning uppercase mb-2 tracking-[0.2em]">📌 Real-World Example</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.realWorldExamples[0]}</p>
                                </div>
                            )}

                            {content.importance && (
                                <div className="bg-surface/50 rounded-2xl p-5 border border-border/50 group hover:border-brand-primary/30 transition-colors">
                                    <p className="text-[10px] font-black text-success uppercase mb-2 tracking-[0.2em]">🎯 Importance</p>
                                    <p className="text-sm text-foreground leading-relaxed">{content.importance}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border bg-surface/30">
                    <button
                        onClick={onContinue}
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/20"
                    >
                        I've got it! → Practice
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
            className="w-full max-w-3xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Type the Answer</span>
                </div>

                <p className="text-base text-foreground-muted mb-2 text-center">What is the definition of:</p>
                <p className="text-xl font-bold text-foreground mb-6 text-center">{card.term}</p>

                <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult}
                    placeholder="Type your answer..."
                    className="w-full p-4 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:border-brand-primary transition-colors text-sm"
                    rows={3}
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
                            className="px-6 py-3 rounded-xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            Check Answer
                        </button>
                    </div>
                ) : !isCorrect && (
                    <div className="flex flex-col items-center mt-8 pt-8 border-t border-border gap-4">
                        <p className="text-sm font-medium text-foreground-muted animate-pulse">Click the correct answer or press any key to continue</p>
                        <button
                            onClick={() => onAnswer(false)}
                            className="px-12 py-4 rounded-2xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
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
            className="w-full max-w-3xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Fill in the Blank</span>
                </div>

                <p className="text-xs font-medium text-foreground-muted mb-2 uppercase tracking-wider text-center">Complete the sentence about:</p>
                <p className="text-lg font-bold text-foreground mb-6 text-center">{card.term}</p>

                <div className="bg-surface/50 rounded-xl p-6 border border-border mb-6">
                    <p className="text-lg text-foreground leading-relaxed italic text-center">{sentence}</p>
                </div>

                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult}
                    placeholder="Type the missing word..."
                    className="w-full p-4 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-muted focus:outline-none focus:border-brand-primary transition-colors"
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
                            className="px-10 py-3 rounded-xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            Check
                        </button>
                    </div>
                ) : !isCorrect && (
                    <div className="flex flex-col items-center mt-8 pt-8 border-t border-border gap-4">
                        <p className="text-sm font-medium text-foreground-muted animate-pulse">Click the correct answer or press any key to continue</p>
                        <button
                            onClick={() => onAnswer(false)}
                            className="px-12 py-4 rounded-2xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
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
            className="w-full max-w-3xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-4">
                    <Mic className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-medium text-brand-primary uppercase tracking-wider">Speaking</span>
                </div>

                <p className="text-lg text-foreground-muted mb-2 text-center">Say the definition for:</p>
                <p className="text-2xl font-bold text-foreground mb-8 text-center">{card.term}</p>

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
            className="w-full max-w-3xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-warning uppercase tracking-[0.2em]">📝 Checkpoint Quiz</span>
                </div>

                <p className="text-lg font-bold text-foreground mb-8 text-center">{card.term}</p>

                <div className="space-y-3">
                    {options.map((option, index) => {
                        let bgClass = 'bg-surface border-border hover:border-brand-primary';

                        if (showResult) {
                            if (index === correctIndex) bgClass = 'bg-success/20 border-success';
                            else if (index === selectedOption) bgClass = 'bg-error/20 border-error';
                        } else if (selectedOption === index) {
                            bgClass = 'bg-brand-primary/20 border-brand-primary';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${bgClass}`}
                            >
                                <span className="w-6 h-6 rounded bg-surface-active flex items-center justify-center text-xs font-bold text-foreground-muted shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-sm text-foreground">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && options[selectedOption!] !== card.definition && (
                <div className="flex flex-col items-center mt-8 gap-4">
                    <p className="text-sm font-medium text-foreground-muted animate-pulse">Click the correct answer or press any key to continue</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="px-12 py-4 rounded-2xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
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
            className="w-full max-w-4xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Multiple Choice</span>
                    <button className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
                        <Volume2 className="w-4 h-4 text-foreground-muted" />
                    </button>
                </div>

                <p className="text-lg font-bold text-foreground leading-relaxed mb-8 text-center">{card.term}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {options.map((option, index) => {
                        let bgClass = 'bg-surface border-border hover:border-brand-primary/50';

                        if (showResult) {
                            if (index === correctIndex) bgClass = 'bg-success/10 border-success/50';
                            else if (index === selectedOption) bgClass = 'bg-error/10 border-error/50';
                        } else if (selectedOption === index) {
                            bgClass = 'bg-brand-primary/10 border-brand-primary';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${bgClass} group`}
                            >
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition-colors ${showResult && index === correctIndex ? 'bg-success text-white' : 'bg-surface-active text-foreground-muted'}`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-sm text-foreground leading-snug pt-1">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && options[selectedOption!] !== card.definition && (
                <div className="flex flex-col items-center mt-8 gap-4">
                    <p className="text-sm font-medium text-foreground-muted animate-pulse">Click the correct answer or press any key to continue</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="px-12 py-4 rounded-2xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
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
            className="w-full max-w-4xl"
        >
            <div className="bg-background-card border border-border rounded-2xl p-8 mb-4">
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">True or False</span>

                <p className="text-lg text-foreground-muted mt-4 mb-2">Is this correct for: <span className="font-bold text-foreground">{card.term}</span></p>

                <div className="bg-surface rounded-xl p-6 mb-6 border border-border">
                    <p className="text-foreground text-lg">"{displayedDefinition}"</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {[true, false].map((val) => {
                        const isCorrectChoice = val === isStatementTrue;
                        let bgClass = 'bg-surface border-border hover:border-brand-primary/50';

                        if (showResult) {
                            if (isCorrectChoice) bgClass = 'bg-success/10 border-success/50';
                            else if (selected === val) bgClass = 'bg-error/10 border-error/50';
                        } else if (selected === val) {
                            bgClass = 'bg-brand-primary/10 border-brand-primary';
                        }

                        return (
                            <button
                                key={String(val)}
                                onClick={() => handleSelect(val)}
                                className={`p-6 rounded-2xl border-2 text-center font-black text-lg transition-all ${bgClass} text-foreground flex flex-col items-center gap-2`}
                            >
                                <span className="text-2xl">{val ? '✓' : '✗'}</span>
                                <span className="text-[10px] uppercase tracking-widest">{val ? 'True' : 'False'}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResult && selected !== isStatementTrue && (
                <div className="flex flex-col items-center mt-8 gap-4">
                    <p className="text-sm font-medium text-foreground-muted animate-pulse">Click the correct answer or press any key to continue</p>
                    <button
                        onClick={() => onAnswer(false)}
                        className="px-12 py-4 rounded-2xl bg-brand-primary text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20"
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
        <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
            {/* Progress Bar Area */}
            <div className="px-12 py-8 flex flex-col gap-6 bg-surface/5 border-b border-border/50">
                <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-1">Current Progress</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">{mastered.length}</span>
                            <span className="text-sm font-bold text-foreground-muted">/ {totalCards} mastered</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Session Accuracy</span>
                        <span className="text-2xl font-black text-brand-primary">{stats.correctFirst > 0 ? Math.round((stats.correctFirst / stats.totalQuestions) * 100) : 100}%</span>
                    </div>
                </div>

                <div className="w-full max-w-5xl mx-auto h-8 bg-surface/30 rounded-full p-1.5 flex gap-1.5 relative overflow-visible shadow-inner">
                    {/* Segmented Bar */}
                    {[1, 2, 3, 4, 5, 6].map((idx) => {
                        const segmentCapacity = 1 / 6;
                        const progress = mastered.length / totalCards;
                        const segmentProgress = Math.min(1, Math.max(0, (progress - (idx - 1) * segmentCapacity) / segmentCapacity));

                        return (
                            <div key={idx} className="flex-1 h-full bg-surface-active rounded-full relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-brand-primary shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${segmentProgress * 100}%` }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                />
                                {idx < 6 && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-background/20 z-10" />
                                )}
                            </div>
                        );
                    })}

                    {/* Checkpoints */}
                    <div className="absolute left-0 -top-1 h-10 w-10 rounded-full bg-surface border-4 border-surface-active flex items-center justify-center z-20 shadow-xl -translate-x-1/2">
                        <span className="text-[10px] font-black text-foreground">0</span>
                    </div>
                    <div className="absolute right-0 -top-1 h-10 w-10 rounded-full bg-surface border-4 border-surface-active flex items-center justify-center z-20 shadow-xl translate-x-1/2">
                        <span className="text-[10px] font-black text-foreground">{totalCards}</span>
                    </div>
                </div>

                {/* Live Insight Row */}
                <div className="flex items-center justify-center gap-8 w-full max-w-5xl mx-auto py-2">
                    {Object.keys(missedCardCounts).length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-error/5 border border-error/20 rounded-full animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-[9px] font-black text-error uppercase tracking-wider">Tricky Concept:</span>
                            <span className="text-xs font-bold text-foreground">{Object.values(missedCardCounts).pop()}</span>
                        </div>
                    )}
                    {mastered.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-success/5 border border-success/20 rounded-full animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-[9px] font-black text-success uppercase tracking-wider">Mastered:</span>
                            <span className="text-xs font-bold text-foreground">{mastered[mastered.length - 1].term}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
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
