import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';


interface RapidFireQuizProps {
    settings: {
        subMode: string;
        studyDirection: string;
        timer: number;
        enableTimer?: boolean;
        soundEffects: boolean;
        cardLimit: number;
        showStreakFx?: boolean;
    };
    cards: Array<{ term: string, definition: string, case?: string, id: number }>;
}

export function RapidFireQuiz({ settings, cards }: RapidFireQuizProps) {
    const [gameState, setGameState] = useState<'counting' | 'playing' | 'gameover'>('counting');
    const [countdown, setCountdown] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(settings.timer);
    const [totalTimeLeft, setTotalTimeLeft] = useState(60); // Velocity mode round timer
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);



    const [history, setHistory] = useState<Array<{ term: string, userAnswer: string, isCorrect: boolean }>>([]);


    const startTimeRef = useRef<number>(Date.now());


    const isVelocity = settings.subMode === 'velocity';
    const isSuddenDeath = settings.subMode === 'sudden';
    const isCaseBlitz = settings.subMode === 'blitz';

    // Initialize round
    const generateOptions = useCallback((correctAnswer: string) => {
        const pool = cards.map(item =>
            settings.studyDirection === 'term-def' ? item.definition : item.term
        );
        const filteredPool = pool.filter(p => p !== correctAnswer);
        const shuffled = filteredPool.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        return [...selected, correctAnswer].sort(() => 0.5 - Math.random());
    }, [settings.studyDirection, cards]);

    const nextQuestion = useCallback(() => {
        // Enforce limit based on settings or deck size (whichever is smaller)
        const effectiveLimit = Math.min(settings.cardLimit || cards.length, cards.length);

        if ((questionsAnswered + 1) >= effectiveLimit && !isVelocity) {
            setGameState('gameover');
            return;
        }

        const nextIdx = (currentIndex + 1) % cards.length;
        setCurrentIndex(nextIdx);
        setQuestionsAnswered(prev => prev + 1);

        const item = cards[nextIdx];
        const correct = settings.studyDirection === 'term-def' ? item.definition : item.term;
        setOptions(generateOptions(correct));
        setTimeLeft(settings.timer);
        setFeedback(null);
        setSelectedAnswer(null);
        startTimeRef.current = Date.now();
    }, [currentIndex, questionsAnswered, settings.cardLimit, settings.timer, settings.studyDirection, generateOptions, isVelocity]);

    const handleAnswer = useCallback((answer: string) => {
        if (gameState !== 'playing' || feedback) return;
        setSelectedAnswer(answer);

        const currentItem = cards[currentIndex];
        const correctAnswer = settings.studyDirection === 'term-def' ? currentItem.definition : currentItem.term;
        const isCorrect = answer === correctAnswer;

        // Record history
        setHistory(prev => [...prev, {
            term: currentItem.term,
            userAnswer: answer,
            isCorrect: isCorrect
        }]);

        if (isCorrect) {
            setFeedback('correct');
            setStreak(prev => prev + 1);

            // Zero-click transition
            setTimeout(nextQuestion, 400);
        } else {
            setFeedback('incorrect');
            setStreak(0);

            if (isSuddenDeath) {
                setTimeout(() => setGameState('gameover'), 600);
                return;
            }

            setTimeout(nextQuestion, 600);
        }
    }, [gameState, feedback, cards, currentIndex, settings.studyDirection, isSuddenDeath, nextQuestion]);

    // Countdown effect
    useEffect(() => {
        if (gameState === 'counting') {
            if (countdown > 0) {
                const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
                return () => clearTimeout(t);
            } else {
                setGameState('playing');
                // Initial setup
                const item = cards[currentIndex];
                const correct = settings.studyDirection === 'term-def' ? item.definition : item.term;
                setOptions(generateOptions(correct));
                startTimeRef.current = Date.now();
            }
        }
    }, [gameState, countdown, currentIndex, generateOptions, settings.studyDirection]);

    // Game Timer Logic
    useEffect(() => {
        if (gameState !== 'playing' || settings.enableTimer === false || feedback !== null) return;

        const interval = setInterval(() => {
            if (isVelocity) {
                setTotalTimeLeft(prev => {
                    if (prev <= 0) {
                        setGameState('gameover');
                        return 0;
                    }
                    return prev - 1;
                });
            }

            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time up - count as incorrect
                    handleAnswer('__WRONG__');
                    return settings.timer;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, isVelocity, settings.timer, handleAnswer, feedback, settings.enableTimer]);

    // Keyboard controls
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
            if (keyMap[e.key] !== undefined) {
                handleAnswer(options[keyMap[e.key]]);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [gameState, options]);

    if (gameState === 'counting') {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-9xl font-black text-brand-primary"
                >
                    {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        const correctCount = history.filter(h => h.isCorrect).length;
        const incorrectCount = history.length - correctCount;
        const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;

        return (
            <div className="flex-1 flex flex-col items-center p-6 bg-background overflow-hidden">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col h-full w-full max-w-4xl"
                >
                    <div className="text-center shrink-0">
                        <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">Session Complete</h2>
                        <p className="text-foreground-secondary mb-6 text-sm">Performance Summary</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto w-full">
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-brand-primary">{accuracy}%</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Accuracy</span>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-success">{correctCount}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Correct</span>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-error">{incorrectCount}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Incorrect</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto min-h-0 mb-8 border border-border rounded-2xl bg-surface/50 p-2">
                        <div className="space-y-2">
                            {history.map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-background-elevated rounded-2xl border border-border hover:border-brand-primary/30 transition-colors">
                                    <div className="min-w-0 flex-1 pr-4">
                                        <p className="text-xs font-bold text-foreground-muted uppercase mb-1">{res.term}</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-bold ${res.isCorrect ? 'text-success' : 'text-error'}`}>
                                                {res.isCorrect ? 'Correct' : 'Incorrect'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        {res.isCorrect ? (
                                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success font-bold">✓</div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error font-bold">✕</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-3 max-w-xs mx-auto w-full pb-2">
                        <div className="btn-wrapper w-full">
                            <button onClick={() => window.location.reload()} className="btn-premium w-full">
                                <span className="btn-text">Try Again</span>
                            </button>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="text-foreground-secondary hover:text-foreground font-medium py-2"
                        >
                            Return to Course
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentItem = cards[currentIndex];
    const isHeatActive = (settings.showStreakFx !== false) && streak >= 5;

    return (
        <div className={`flex-1 flex flex-col items-center relative transition-all duration-700 w-full overflow-hidden ${feedback === 'incorrect' ? 'bg-error/5' : ''} ${isHeatActive ? 'bg-gradient-to-br from-orange-500/10 via-background to-orange-600/10' : 'bg-background'}`}>

            {/* Full Width Timer Bar */}


            {/* Heat Overlay */}
            <AnimatePresence>
                {isHeatActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none z-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-orange-500/10 animate-pulse-slow" />
                        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(249,115,22,0.25)]" />

                        {/* Dynamic speed lines or particles could go here */}
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                animate={{ y: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-full h-full opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,white_21px)]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar Stats */}
            <div className="w-full px-8 py-14 relative flex items-center justify-between z-10">
                {/* Left: Empty for now (previously session) */}
                <div className="flex items-center gap-8 w-24">

                </div>


                {/* Center: Streak & Timer */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
                    {/* Streak Pill */}
                    <div className={`flex flex-col items-center justify-center min-w-[120px] px-6 py-2 rounded-full border shadow-sm transition-all duration-300 ${streak >= 10 ? 'bg-orange-500/10 border-orange-500 text-orange-500' : streak >= 5 ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-background-elevated border-border text-foreground'}`}>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Streak</span>
                        <span className="text-xl font-black tabular-nums leading-none mt-0.5">{streak}</span>
                    </div>

                    {/* Timer Pill */}
                    <div className={`flex flex-col items-center justify-center min-w-[120px] px-6 py-2 rounded-full border border-border shadow-sm transition-all duration-300 ${timeLeft < 5 ? 'bg-error text-white animate-pulse' : 'bg-background-elevated text-foreground'}`}>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Timer</span>
                        <span className="text-xl font-black tabular-nums leading-none mt-0.5">{timeLeft}s</span>
                    </div>
                </div>

                {/* Right: Round Time (Velocity Mode) */}
                <div className="flex items-center justify-end w-24">
                    {isVelocity && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Round Time</span>
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-brand-primary" />
                                <span className={`text-2xl font-black tabular-nums ${totalTimeLeft < 10 ? 'text-error animate-pulse' : ''}`}>
                                    {totalTimeLeft}s
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quiz Content */}
            <div className="flex-1 w-full flex flex-col justify-center px-4 md:px-12 z-10 max-w-6xl mx-auto">
                {/* Streak Milestone Overlay Removed - User requested fix for streak design */}

                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-center mb-10"
                >

                    <h3 className={`font-black leading-tight max-w-3xl mx-auto tracking-tighter transition-all duration-300 ${isHeatActive ? 'text-6xl scale-110' : 'text-4xl md:text-5xl'}`}>
                        {isCaseBlitz
                            ? (currentItem.case || `Scenario: Patient presents with symptoms matching ${currentItem.term}...`)
                            : (settings.studyDirection === 'term-def' ? currentItem.term : currentItem.definition)
                        }
                    </h3>
                </motion.div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option, idx) => {
                        const currentItem = cards[currentIndex];
                        const correctAnswer = settings.studyDirection === 'term-def' ? currentItem.definition : currentItem.term;
                        const isThisCorrect = option === correctAnswer;

                        const isSelected = option === selectedAnswer;

                        let stateStyles = "bg-background-elevated border-border hover:border-brand-primary hover:shadow-xl hover:-translate-y-1";
                        if (feedback === 'correct' && isThisCorrect) {
                            stateStyles = "bg-success border-success text-white shadow-lg shadow-success/20";
                        } else if (feedback === 'incorrect' && isSelected) {
                            stateStyles = "bg-error border-error text-white";
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                disabled={!!feedback}
                                className={`
                                    group relative flex items-center p-6 rounded-3xl border-2 transition-all duration-200 text-left
                                    ${stateStyles}
                                `}
                            >
                                <div className="flex items-center gap-6 w-full">
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-colors
                                        ${feedback && isThisCorrect ? 'bg-white text-success' : 'bg-surface-active text-foreground-muted group-hover:bg-brand-primary group-hover:text-white'}
                                    `}>
                                        {idx + 1}
                                    </div>
                                    <span className="text-lg font-bold flex-1">{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>


        </div>

    );
}
