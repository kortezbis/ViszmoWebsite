import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, XCircle, ChevronRight, X, HelpCircle } from 'lucide-react';


interface WrittenGameProps {
    settings: {
        similarityThreshold: number;
        instantFeedback: boolean;
        autoSanitize: boolean;
        questionFocus: 'term' | 'definition' | 'mixed';
        [key: string]: any;
    };
    cards: Array<{ term: string, definition: string, case?: string, id: number }>;
}

interface DiffPart {
    value: string;
    type: 'correct' | 'missing' | 'incorrect';
}

/**
 * Advanced LCS-based Diff Logic for "Smart Grading"
 */
function getDiff(expected: string, actual: string, sanitize: boolean): DiffPart[] {
    const s1 = sanitize ? expected.toLowerCase().trim() : expected;
    const s2 = sanitize ? actual.toLowerCase().trim() : actual;

    const n = s1.length;
    const m = s2.length;

    // DP Table for LCS
    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to build Diff
    const stack: DiffPart[] = [];
    let i = n, j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
            stack.push({ value: s1[i - 1], type: 'correct' });
            i--; j--;
        } else {
            // Prioritize Missing (Deletion from Expected) over Incorrect (Insertion into Actual) for better readability
            if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
                stack.push({ value: s1[i - 1], type: 'missing' });
                i--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                stack.push({ value: s2[j - 1], type: 'incorrect' });
                j--;
            }
        }
    }
    return stack.reverse();
}

// Simple Levenshtein distance for similarity
function getSimilarity(s1: string, s2: string, sanitize: boolean): number {
    const a = sanitize ? s1.toLowerCase().trim() : s1;
    const b = sanitize ? s2.toLowerCase().trim() : s2;

    const costs = new Array();
    for (let i = 0; i <= a.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= b.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (a.charAt(i - 1) != b.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[b.length] = lastValue;
    }
    const distance = costs[b.length];
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 100;
    return Math.floor((1 - distance / maxLen) * 100);
}

function StandardWrittenGame({ settings, cards }: WrittenGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [gameState, setGameState] = useState<'playing' | 'feedback' | 'gameover'>('playing');
    const [results, setResults] = useState<{ itemIdx: number, similarity: number, input: string }[]>([]);
    const [currentDiff, setCurrentDiff] = useState<DiffPart[]>([]);
    const [currentSimilarity, setCurrentSimilarity] = useState(0);

    // Hint System
    const [hintCount, setHintCount] = useState(0);
    const [hintPenalty, setHintPenalty] = useState(0);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const currentItem = cards[currentIndex];
    const focusMode = settings.questionFocus || 'term';
    const prompt = focusMode === 'term' ? currentItem.definition : currentItem.term;
    const answer = focusMode === 'term' ? currentItem.term : currentItem.definition;



    useEffect(() => {
        if (gameState === 'playing') {
            inputRef.current?.focus();
        }
    }, [gameState, currentIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (gameState === 'playing') {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
            if (e.key === 'Control') {
                // Adaptive Hinting: Reveal next char
                const nextCharIndex = userInput.length;
                if (nextCharIndex < answer.length) {
                    const charToReveal = answer[nextCharIndex];
                    setUserInput(prev => prev + charToReveal);
                    setHintCount(prev => prev + 1);
                    setHintPenalty(prev => prev + 15); // 15% penalty per hint
                }
            }
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (gameState !== 'playing' || !userInput.trim()) return;

        let similarity = getSimilarity(answer, userInput, settings.autoSanitize);

        // Apply Penalty
        similarity = Math.max(0, similarity - hintPenalty);

        const diff = getDiff(answer, userInput, settings.autoSanitize);

        setCurrentSimilarity(similarity);
        setCurrentDiff(diff);

        if (settings.instantFeedback) {
            setGameState('feedback');
        } else {
            processNext(similarity);
        }
    };

    const processNext = (similarity: number) => {
        const newResults = [...results, { itemIdx: currentIndex, similarity, input: userInput }];
        setResults(newResults);
        setUserInput('');
        setHintCount(0);
        setHintPenalty(0);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setGameState('playing');
        } else {
            setGameState('gameover');
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setUserInput('');
        setResults([]);
        setGameState('playing');
        setHintCount(0);
        setHintPenalty(0);
    };

    if (gameState === 'gameover') {
        const avgScore = Math.floor(results.reduce((acc, r) => acc + r.similarity, 0) / results.length);
        const correctCount = results.filter(r => r.similarity >= settings.similarityThreshold).length;
        const incorrectCount = results.length - correctCount;

        return (
            <div className="flex-1 flex flex-col items-center p-6 bg-background overflow-hidden">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col h-full w-full max-w-4xl">
                    <div className="text-center shrink-0">
                        <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">Session Complete</h2>
                        <p className="text-foreground-secondary mb-6 text-sm">Performance analysis finalized</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto w-full">
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-brand-primary">{avgScore}%</span>
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
                            {results.map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-background-elevated rounded-2xl border border-border hover:border-brand-primary/30 transition-colors">
                                    <div className="min-w-0 flex-1 pr-4">
                                        <p className="text-xs font-bold text-foreground-muted uppercase mb-1">{cards[res.itemIdx].term}</p>
                                        <div className="flex items-center gap-2">
                                            {res.similarity >= settings.similarityThreshold ? (
                                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-error shrink-0" />
                                            )}
                                            <p className="text-sm font-medium truncate">{res.input || "(No Answer)"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-lg font-black ${res.similarity >= settings.similarityThreshold ? 'text-success' : 'text-error'}`}>
                                            {res.similarity}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 flex justify-center pb-2">
                        <div className="btn-wrapper">
                            <button onClick={handleRetry} className="btn-premium">
                                <span className="btn-text">Restart Session</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }



    return (
        <div className="flex-1 flex flex-col items-center p-6 bg-background relative overflow-y-auto">


            <div className="w-full max-w-6xl my-auto">
                {/* Stats */}
                <div className="flex items-center justify-between mb-12 px-4 relative">

                    <div className="flex flex-col ml-10">

                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest leading-none mb-1">Question</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black">{currentIndex + 1}</span>
                            <span className="text-foreground-muted font-bold text-lg">/ {cards.length}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-32 bg-surface-active rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-brand-primary"
                            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="text-center mb-12 relative"
                    >


                        <div>
                            <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-4 select-none">
                                {prompt}
                            </h3>
                            {currentItem.case && (
                                <p className="text-foreground-secondary italic text-base max-w-xl mx-auto bg-surface p-4 rounded-xl border border-border">
                                    Context: {currentItem.case}
                                </p>
                            )}
                        </div>

                        {/* Hint Feedback */}
                        {hintCount > 0 && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
                                Hints Used: {hintCount} (-{hintPenalty}%)
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto w-full">
                    <div className={`
                         relative bg-background-elevated border-2 rounded-3xl p-6 transition-all duration-300 shadow-xl
                         ${gameState === 'feedback' ? 'border-border opacity-50' : 'border-border-strong focus-within:border-brand-primary focus-within:shadow-brand-primary/20'}
                    `}>
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={gameState === 'feedback'}
                            rows={6}
                            className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-medium text-center text-foreground placeholder-foreground-muted/50 resize-none p-4 leading-relaxed"
                            placeholder="Type your answer here..."
                            spellCheck={false}
                        />
                        {gameState === 'playing' && (
                            <div className="absolute right-4 bottom-4 text-xs font-bold text-foreground-muted uppercase tracking-widest hidden md:flex items-center gap-4">
                                <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Ctrl for Hint</span>
                                <span className="flex items-center gap-1"><Send className="w-4 h-4" /> Enter to Submit</span>
                            </div>
                        )}
                    </div>
                </form>

                {/* Smart Grading Feedback Engine */}
                <AnimatePresence>
                    {gameState === 'feedback' && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-8 bg-background-elevated border border-border p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    {currentSimilarity >= settings.similarityThreshold ? (
                                        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center text-error">
                                            <XCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-1">Result</p>
                                        <h4 className={`text-2xl font-black ${currentSimilarity >= settings.similarityThreshold ? 'text-success' : 'text-error'}`}>
                                            {currentSimilarity >= settings.similarityThreshold ? 'Correct' : 'Incorrect'}
                                            <span className="ml-3 text-lg opacity-80 text-foreground">{currentSimilarity}% Accuracy</span>
                                        </h4>
                                    </div>
                                </div>
                                <button
                                    onClick={() => processNext(currentSimilarity)}
                                    className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-foreground-muted uppercase mb-3 tracking-widest">Correction</p>
                                    <div className="bg-surface border border-border p-6 rounded-xl text-lg flex flex-wrap gap-x-1 leading-relaxed justify-center">
                                        {currentDiff.map((part, i) => (
                                            <span
                                                key={i}
                                                className={`
                                                    py-0.5 px-1 rounded-md font-medium
                                                    ${part.type === 'correct' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : ''}
                                                    ${part.type === 'missing' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 decoration-2 underline' : ''}
                                                    ${part.type === 'incorrect' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 line-through decoration-2' : ''}
                                                `}
                                                title={part.type}
                                            >
                                                {part.value === ' ' ? '\u00A0' : part.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-surface rounded-xl border border-border text-center">
                                    <p className="text-[10px] font-bold text-foreground-muted uppercase mb-1">Correct Answer</p>
                                    <p className="font-bold text-base">{answer}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function WordRevealGame({ settings, cards }: WrittenGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [guessed, setGuessed] = useState<Set<string>>(new Set());
    const [wrongCount, setWrongCount] = useState(0);
    const [status, setStatus] = useState<'playing' | 'win' | 'lose' | 'finished'>('playing');
    const [score, setScore] = useState(0);
    const [showFullInput, setShowFullInput] = useState(false);

    const [fullInputGuess, setFullInputGuess] = useState('');


    const currentCard = cards[currentIndex];

    // Safety check for empty cards
    if (!currentCard) return null;

    const focusMode = settings.questionFocus || 'term';
    const answerRaw = focusMode === 'term' ? currentCard.term : currentCard.definition;
    const prompt = focusMode === 'term' ? currentCard.definition : currentCard.term;
    const answerUpper = answerRaw.toUpperCase();

    const maxLives = 6;
    const isLetter = (c: string) => /[A-Z]/.test(c);

    useEffect(() => {
        setGuessed(new Set());
        setWrongCount(0);
        setStatus('playing');
        setShowFullInput(false);
        setFullInputGuess('');
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'playing' || showFullInput) return;
            const char = e.key.toUpperCase();
            if (isLetter(char) && char.length === 1) {
                handleGuess(char);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, guessed, answerUpper, showFullInput]);

    const handleGuess = (char: string) => {
        if (guessed.has(char) || status !== 'playing') return;

        const newGuessed = new Set(guessed).add(char);
        setGuessed(newGuessed);

        if (!answerUpper.includes(char)) {
            const newWrong = wrongCount + 1;
            setWrongCount(newWrong);
            if (newWrong >= maxLives) {
                setStatus('lose');
            }
        } else {
            const isWin = answerUpper.split('').every(c => !isLetter(c) || newGuessed.has(c));
            if (isWin) {
                setStatus('win');
                setScore(s => s + 1);
            }
        }
    };

    const handleFullGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullInputGuess.trim()) return;

        const guess = fullInputGuess.trim().toUpperCase();
        // Simple exact match logic
        if (guess === answerUpper.trim()) {
            setStatus('win');
            setScore(s => s + 1);
            // Reveal all letters visually too
            const allChars = new Set(guessed);
            answerUpper.split('').forEach(c => allChars.add(c));
            setGuessed(allChars);
        } else {
            const newWrong = wrongCount + 1;
            setWrongCount(newWrong);
            if (newWrong >= maxLives) {
                setStatus('lose');
            }
            setFullInputGuess(''); // Clear for retry
            // Ideally show a "Wrong guess" toast here
        }
        setShowFullInput(false);
    };

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setStatus('finished');
        }
    };

    if (status === 'finished') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full max-h-screen overflow-y-auto">
                <h2 className="text-3xl font-black mb-4">Set Complete!</h2>
                <p className="text-xl mb-8">You guessed {score} out of {cards.length} correctly.</p>
                <div className="btn-wrapper">
                    <button onClick={() => window.location.reload()} className="btn-premium px-8 py-3">
                        <span className="btn-text">Play Again</span>
                    </button>
                </div>
            </div>
        );
    }

    const displayedWord = answerUpper.split('').map((char) => {
        if (!isLetter(char)) return char;
        return guessed.has(char) ? char : '';
    });

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-6 overflow-hidden relative">
            {/* Header / Stats */}
            <div className="shrink-0 w-full flex justify-between items-center mb-4 md:mb-6">
                <div className="flex items-center gap-3">

                    <div className="text-xs font-bold text-foreground-muted uppercase tracking-widest">
                        Word {currentIndex + 1} / {cards.length}
                    </div>
                </div>

                <div className="flex gap-1.5">
                    {Array.from({ length: maxLives }).map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i < (maxLives - wrongCount) ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-error/10'}`} />
                    ))}
                </div>
            </div>

            {/* Main Game Area - Flex container to distribute space */}
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 relative">

                {/* Prompt - Scrollable if long */}
                <div className="w-full max-h-[25vh] overflow-y-auto mb-6 md:mb-10 px-4 text-center">
                    <p className="text-foreground-secondary text-lg md:text-2xl font-medium leading-normal max-w-3xl mx-auto">
                        {prompt}
                    </p>
                </div>

                {/* The Word - Wrap naturally */}
                <div className="w-full flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2">
                    {answerUpper.split('').map((char, i) => (
                        <div key={i} className={`
                            w-8 h-10 md:w-12 md:h-14 flex items-center justify-center text-xl md:text-3xl font-black rounded-lg transition-all duration-300
                            ${!isLetter(char) ? 'bg-transparent text-foreground-muted' :
                                displayedWord[i] ? 'bg-surface border-2 border-brand-primary text-foreground shadow-lg scale-100' : 'bg-surface-active border-2 border-transparent scale-95 opacity-80'}
                            ${status === 'lose' && !displayedWord[i] && isLetter(char) ? 'text-error opacity-100 border-error/50 bg-error/5' : ''}
                        `}>
                            {!isLetter(char) ? char : (displayedWord[i] ? char : (status === 'lose' ? char : ''))}
                        </div>
                    ))}
                </div>

                {/* Status & Actions Area - Fixed Height for stability */}
                <div className="h-14 w-full flex items-center justify-center shrink-0 mb-4 md:mb-8 relative z-10">
                    <AnimatePresence mode="wait">
                        {status === 'playing' && !showFullInput && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onClick={() => setShowFullInput(true)}
                                className="text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors bg-brand-primary/10 px-4 py-2 rounded-full hover:bg-brand-primary/20"
                            >
                                Know it? Guess full word
                            </motion.button>
                        )}

                        {status === 'playing' && showFullInput && (
                            <motion.form
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onSubmit={handleFullGuess}
                                className="flex gap-2 w-full max-w-sm bg-background-elevated p-1.5 rounded-xl border border-brand-primary/30 shadow-xl"
                            >
                                <input
                                    autoFocus
                                    value={fullInputGuess}
                                    onChange={e => setFullInputGuess(e.target.value)}
                                    className="flex-1 bg-surface px-3 py-1.5 rounded-lg text-sm font-medium outline-none text-foreground placeholder-foreground-muted"
                                    placeholder="Type full answer..."
                                />
                                <button type="submit" className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90">Guess</button>
                                <button type="button" onClick={() => setShowFullInput(false)} className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-hover"><X size={16} /></button>
                            </motion.form>
                        )}

                        {status === 'win' && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-4 bg-success/10 px-6 py-2 rounded-2xl border border-success/20">
                                <span className="text-success font-black text-lg uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
                                <button onClick={nextCard} className="px-4 py-1.5 bg-success text-white rounded-lg text-sm font-bold hover:shadow-lg hover:scale-105 transition-all">Next</button>
                            </motion.div>
                        )}

                        {status === 'lose' && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-4 bg-error/10 px-6 py-2 rounded-2xl border border-error/20">
                                <span className="text-error font-black text-lg uppercase tracking-widest flex items-center gap-2"><XCircle className="w-5 h-5" /> Missed it!</span>
                                <button onClick={nextCard} className="px-4 py-1.5 bg-foreground text-background rounded-lg text-sm font-bold hover:shadow-lg hover:scale-105 transition-all">Next</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Keyboard - Compact Grid at bottom */}
            <div className="shrink-0 w-full max-w-3xl mx-auto">
                <div className="grid grid-cols-7 sm:grid-cols-[repeat(13,minmax(0,1fr))] gap-1 md:gap-1.5">
                    {alphabet.map(letter => {
                        let state = 'default';
                        if (guessed.has(letter)) {
                            state = answerUpper.includes(letter) ? 'correct' : 'wrong';
                        }

                        return (
                            <button
                                key={letter}
                                onClick={() => handleGuess(letter)}
                                disabled={guessed.has(letter) || status !== 'playing'}
                                className={`
                                    h-10 sm:h-auto sm:aspect-square rounded-md md:rounded-lg font-bold text-sm sm:text-base border transition-all duration-200
                                    ${state === 'default' ? 'bg-surface hover:bg-surface-hover hover:border-foreground/20 text-foreground border-transparent md:border-border' : ''}
                                    ${state === 'correct' ? 'bg-success text-white border-success shadow-sm scale-95 opacity-50' : ''}
                                    ${state === 'wrong' ? 'bg-surface-active text-foreground-muted border-transparent opacity-30 scale-90' : ''}
                                `}
                            >
                                {letter}
                            </button>
                        )
                    })}
                </div>
            </div>



        </div >

    );
}

export function WrittenGame(props: WrittenGameProps) {
    if (props.settings.subMode === 'word-reveal') {
        return <WordRevealGame {...props} />;
    }
    return <StandardWrittenGame {...props} />;
}
