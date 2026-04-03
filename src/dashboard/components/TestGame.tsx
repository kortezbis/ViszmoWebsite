import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Volume2,
    XCircle,
    RotateCcw
} from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';

interface TestGameProps {
    settings: {
        testLength: number;
        sourceLogic: 'all' | 'starred';
        shuffle: boolean;
        enableTimer: boolean;
        allowBacktracking: boolean;
        answerFormat: 'term' | 'definition' | 'both';
        similarityThreshold: number;
        [key: string]: any;
    };
    cards: Array<{ term: string, definition: string, case?: string, id: number }>;
}

type QuestionType = 'case' | 'written' | 'mcq' | 'flashcard' | 'tf' | 'matching';

interface Question {
    type: QuestionType;
    id: string;
    itemIdx: number;
    prompt: string;
    answer: string;
    options?: string[]; // for mcq and case
    tfValue?: boolean; // for true/false
    displayAnswer?: string; // for tf display
    matchingPairs?: Array<{ id: string; left: string; right: string }>; // for matching
    shuffledLeft?: Array<{ id: string; text: string }>;
    shuffledRight?: Array<{ id: string; text: string }>;
}

interface UserAnswer {
    value: any;
    isCorrect?: boolean;
    similarity?: number;
    isSkipped?: boolean; // Track if question was explicitly skipped
}

function getSimilarity(s1: string, s2: string): number {
    const a = s1.toLowerCase().trim();
    const b = s2.toLowerCase().trim();
    if (a === b) return 100;

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

export function TestGame({ settings, cards }: TestGameProps) {
    const { resolvedTheme } = useTheme();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});



    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

    const [timeLeft, setTimeLeft] = useState(settings.testLength * 30); // 30s per question base
    const [activeDropdown, setActiveDropdown] = useState<{ qIdx: number; rowId: string } | null>(null);

    const [isMapOpen, setIsMapOpen] = useState(true);

    const initTest = useCallback(() => {
        const pool = [...cards];
        if (settings.shuffle) pool.sort(() => Math.random() - 0.5);

        // Fallback to testLength for legacy or default to cardLimit standard
        const limit = settings.cardLimit || settings.testLength || 25;
        const count = Math.min(limit, pool.length);
        const selected = pool.slice(0, count);

        const types: QuestionType[] = [];
        if (settings.includeMCQ !== false) types.push('mcq');
        if (settings.includeWritten !== false) types.push('written');
        if (settings.includeTF !== false) types.push('tf');
        if (settings.includeCase !== false) types.push('case');
        if (settings.includeMatching !== false) types.push('matching');

        // Fallback default
        if (types.length === 0) types.push('mcq');

        const questionsList: Question[] = [];
        let i = 0;
        let qIndex = 0;

        // 1. Check for Matching
        if (settings.includeMatching !== false && selected.length >= 3) {
            // How many to use for matching? Use ALL selected items for one big test?
            // "it should all be in one question"

            const matchingItems = [...selected]; // Use everything for the matching set!

            const q: Question = {
                id: `q-${qIndex}`,
                itemIdx: 0, // This question covers all items from the start
                type: 'matching',
                prompt: 'Match all terms and definitions correctly below.',
                answer: 'ALL_MATCHED'
            };

            q.matchingPairs = matchingItems.map((item) => ({
                id: item.id.toString(),
                left: settings.answerFormat === 'definition' ? item.definition : item.term,
                right: settings.answerFormat === 'definition' ? item.term : item.definition
            }));

            // Shuffle left and right independently
            q.shuffledLeft = q.matchingPairs.map(p => ({ id: p.id, text: p.left })).sort(() => Math.random() - 0.5);
            q.shuffledRight = q.matchingPairs.map(p => ({ id: p.id, text: p.right })).sort(() => Math.random() - 0.5);

            questionsList.push(q);
            qIndex++;

            // If matching consumes everything, we are done.
            // But usually user might mix types.
            // The user request "it should all be in one questions... whatever the first answer is that would be question one"
            // implies the Matching Section IS the test or the first big part of it.

            // Interpreting "It should all be on one big container":
            // If this is a Mixed test, we probably shouldn't duplicate items.
            // If we use all items for matching, we can't use them for MCQ.

            // Strategy: If matching is enabled, make ONE giant matching question with X items (e.g. up to 20? 100?).
            // For now, let's assume if Matching is ON, we prioritize it for strict "Matching Mode" feel
            // OR we just take a chunk.

            // "whatever the first answer is that would be question one" -> Question 1 is the big matching block?
            // Let's consume ALL items into this one question if matching is strictly requested.

            // ACTUALLY: The user logic in `initTest` was checking `types` per item.
            // If we want ONE big container, we should probably consume `selected` entirely?
            // Let's assume for this specific request, if Matching is enabled, we essentially convert the whole test content
            // into one scrollable matching list (or as much as fits).

            // If mixed with others is desired, we'd need to only take a slice.
            // Given "it should all be in one questions", I will consume ALL `selected` items.
            i = selected.length;
        } else {
            // Standard loop for non-matching or if matching disabled
            while (i < selected.length) {
                let type = types[Math.floor(Math.random() * types.length)];
                // Filter out matching from random pick if we didn't do the big block (or if we did, we won't be here)
                if (type === 'matching') type = 'mcq';

                const item = selected[i];
                let answerIsTerm = true;
                if (settings.answerFormat === 'definition') answerIsTerm = false;
                else if (settings.answerFormat === 'both') answerIsTerm = Math.random() > 0.5;
                else answerIsTerm = true;

                const q: Question = {
                    id: `q-${qIndex}`,
                    itemIdx: cards.indexOf(item),
                    type,
                    prompt: '',
                    answer: answerIsTerm ? item.term : item.definition
                };

                switch (type) {
                    case 'case':
                        q.prompt = item.case || 'No case available';
                        q.options = [item.term, item.definition, 'Incorrect A', 'Incorrect B'].sort(() => Math.random() - 0.5);
                        const distractorsCase = pool.filter(x => x.id !== item.id).slice(0, 3).map(x => answerIsTerm ? x.term : x.definition);
                        if (distractorsCase.length === 3) q.options = [q.answer, ...distractorsCase].sort(() => Math.random() - 0.5);
                        q.answer = answerIsTerm ? item.term : item.definition;
                        break;
                    case 'written':
                    case 'mcq':
                        q.prompt = answerIsTerm ? item.definition : item.term;
                        if (type === 'mcq') {
                            const others = pool.filter(x => x.id !== item.id).map(x => answerIsTerm ? x.term : x.definition);
                            others.sort(() => Math.random() - 0.5);
                            q.options = [q.answer, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
                        }
                        break;
                    case 'flashcard':
                        q.prompt = answerIsTerm ? item.definition : item.term;
                        break;
                    case 'tf':
                        const isTrue = Math.random() > 0.5;
                        q.tfValue = isTrue;
                        let falseDef = '...';
                        if (!isTrue) {
                            const other = pool.find(x => x.id !== item.id);
                            falseDef = other ? (answerIsTerm ? other.term : other.definition) : 'False Value';
                        }
                        q.prompt = `Statement: ${answerIsTerm ? item.definition : item.term} is the ${answerIsTerm ? 'term for' : 'definition of'} "${isTrue ? (answerIsTerm ? item.term : item.definition) : falseDef}"`;
                        if (isTrue) {
                            q.prompt = `${item.term} \n\nMatches: \n${item.definition}`;
                        } else {
                            const other = pool.find(x => x.id !== item.id) || item;
                            q.prompt = `${item.term} \n\nMatches: \n${other.definition}`;
                        }
                        q.answer = isTrue ? 'True' : 'False';
                        break;
                }
                questionsList.push(q);
                i++;
                qIndex++;
            }
        }

        setQuestions(questionsList);
        setCurrentIndex(0);
        setUserAnswers({});
        setGameState('playing');
        setTimeLeft(selected.length * 45); // Time based on item count, not question count

    }, [settings, cards]);

    useEffect(() => {
        initTest();
    }, [initTest]);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollObserverRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = Number(entry.target.getAttribute('data-index'));
                    setCurrentIndex(idx);
                }
            });
        }, {
            root: containerRef.current,
            threshold: 0.5
        });

        scrollObserverRef.current = observer;
        return () => observer.disconnect();
    }, [questions]);

    useEffect(() => {
        if (gameState !== 'playing' || !settings.enableTimer) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, settings.enableTimer]);

    const handleAnswer = (val: any, idx: number) => {
        const q = questions[idx];
        const newAnswers = { ...userAnswers };

        let answerObj: UserAnswer = { value: val };

        if (q.type === 'written') {
            const sim = getSimilarity(q.answer, val);
            answerObj.similarity = sim;
            answerObj.isCorrect = sim >= (settings.similarityThreshold || 85);
        } else if (q.type === 'flashcard') {
            answerObj.isCorrect = val;
        } else if (q.type === 'matching') {
            // Check if all pairs are correct
            const pairs = q.matchingPairs || [];
            const userPairs = val as Record<string, string>;
            const correctCount = pairs.reduce((acc, p) => {
                if (userPairs[p.id] && userPairs[p.id] === p.id) return acc + 1; // Logic assumption: IDs match?
                // Wait, shuffledLeft/Right use same ID as matchingPair.
                // So if left(id) connects to right(id), it's correct.
                // Re-verify logic:
                // q.matchingPairs[0].id is "pair-123-0".
                // shuffledLeft has {id: "pair-123-0", text: ...}
                // shuffledRight has {id: "pair-123-0", text: ...}
                // So yes, value[leftId] === rightId means value["pair-123-0"] === "pair-123-0".
                return acc + (userPairs[p.id] === p.id ? 1 : 0);
            }, 0);

            // Score based on completion (require 100% for isCorrect?)
            // Let's say yes for now.
            answerObj.isCorrect = correctCount === pairs.length;
        } else {
            answerObj.isCorrect = val === q.answer;
        }

        newAnswers[idx] = answerObj;
        setUserAnswers(newAnswers);
    };

    const handleSkip = (idx: number) => {
        const newAnswers = { ...userAnswers };
        newAnswers[idx] = { value: null, isSkipped: true, isCorrect: false };
        setUserAnswers(newAnswers);

        // Auto-advance to next question
        if (idx < questions.length - 1) {
            scrollToQuestion(idx + 1);
        }
    };

    const finishTest = () => {
        setGameState('finished');
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (gameState === 'finished') {
        let totalItems = 0;
        let correctItems = 0;

        questions.forEach((q, idx) => {
            const ua = userAnswers[idx];

            if (q.type === 'matching') {
                const pairs = q.matchingPairs || [];
                totalItems += pairs.length;

                // Count correct pairs
                if (ua && ua.value) {
                    const userPairs = ua.value as Record<string, string>;
                    pairs.forEach(p => {
                        if (userPairs[p.id] === p.id) {
                            correctItems++;
                        }
                    });
                }
            } else {
                totalItems++;
                if (ua && ua.isCorrect) {
                    correctItems++;
                }
            }
        });

        const percent = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center w-full max-w-2xl">
                    <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Exam Complete</h2>
                    <p className="text-foreground-secondary mb-8">Performance analysis finalized</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-12">
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black ${percent >= 80 ? 'text-success' : percent >= 60 ? 'text-amber-400' : 'text-error'}`}>{percent}%</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Grade</span>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-success">{correctItems}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Correct</span>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-error">{totalItems - correctItems}</span>
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest mt-1">Incorrect</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <div className="btn-wrapper w-full">
                            <button onClick={initTest} className={`btn-custom ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'} w-full h-14 rounded-full text-lg shadow-xl`}>
                                <span className="btn-text font-bold">Retake Exam</span>
                            </button>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="text-foreground-secondary hover:text-foreground font-medium py-3"
                        >
                            Return to Course
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Scroll to specific question function
    const scrollToQuestion = (index: number) => {
        const el = document.getElementById(`question-${index}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setCurrentIndex(index);
        }
    };

    return (
        <div className="flex-1 flex bg-background text-foreground relative overflow-hidden h-screen font-sans">
            {/* Sidebar */}
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isMapOpen && (
                    <motion.aside
                        initial={{ x: -260 }}
                        animate={{ x: 0 }}
                        exit={{ x: -260 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute left-0 top-0 w-64 h-full flex flex-col shrink-0 z-50 pt-6"
                    >
                        <div className="px-6">
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors text-sm font-bold mb-8"
                            >
                                <span>Hide question list</span>
                            </button>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-brand-primary font-bold text-sm mb-4">Multiple choice</h3>
                                    <div className="flex flex-col gap-1">
                                        {questions.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => scrollToQuestion(idx)}
                                                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${currentIndex === idx
                                                    ? 'bg-surface-hover text-foreground font-bold'
                                                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {!isMapOpen && (
                <div className="absolute top-6 left-8 z-40">
                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors text-sm font-bold"
                    >
                        <span>Show question list</span>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {/* Header */}
                <div className="w-full flex items-center justify-between px-8 py-6 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Question</span>
                            <span className="text-2xl font-black tabular-nums">
                                {currentIndex + 1}
                                <span className="text-foreground-secondary/40 mx-1">/</span>
                                {questions.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">

                        {/* Timer */}
                        {settings.enableTimer && (
                            <div className="flex items-center gap-2 text-foreground-secondary font-medium bg-surface/50 px-3 py-1.5 rounded-full border border-border">
                                <Clock className="w-4 h-4" />
                                <span className="tabular-nums">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto px-6 md:px-20 py-20 space-y-16 no-scrollbar scroll-smooth"
                >
                    {questions.map((q, idx) => (
                        <div
                            key={q.id}
                            id={`question-${idx}`}
                            data-index={idx}
                            ref={(el) => {
                                if (el && scrollObserverRef.current) {
                                    scrollObserverRef.current.observe(el);
                                }
                            }}
                            className="w-full max-w-5xl mx-auto"
                        >
                            <div className="bg-surface rounded-3xl p-12 border border-border shadow-md relative">
                                {/* Question Header */}
                                <div className="flex items-center justify-between mb-8 text-foreground-secondary">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {settings.answerFormat === 'definition' ? 'Term' : 'Definition'}
                                        </span>
                                        <button className="hover:text-foreground transition-colors">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {idx + 1} of {questions.length}
                                    </div>
                                </div>

                                {/* Question Body */}
                                <div className="mb-10">
                                    <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                                        {idx + 1}. {q.prompt}
                                    </h3>
                                </div>

                                {/* Options */}
                                {q.type === 'mcq' || q.type === 'case' ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-foreground-secondary font-medium mb-4">Choose an answer</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {q.options?.map((opt, i) => {
                                                const isSelected = userAnswers[idx]?.value === opt;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAnswer(opt, idx)}
                                                        className={`
                                                            p-4 rounded-lg border-2 text-left transition-all h-full flex items-center
                                                            ${isSelected
                                                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                                                : 'border-border bg-transparent text-foreground hover:border-border-strong hover:bg-surface-hover'}
                                                        `}
                                                    >
                                                        <span className="font-medium text-sm md:text-base leading-snug">{opt}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : q.type === 'matching' ? (
                                    <div className="flex flex-col lg:flex-row gap-8 h-full items-start">
                                        {/* Left Side: Questions/Slots */}
                                        <div className="flex-1 space-y-4 w-full">
                                            {q.shuffledLeft?.map(rowItem => {
                                                const currentVal = userAnswers[idx]?.value || {};
                                                const matchedAnswerId = currentVal[rowItem.id];
                                                const matchedAnswer = q.shuffledRight?.find(a => a.id === matchedAnswerId);

                                                return (
                                                    <div key={rowItem.id} className="p-5 rounded-2xl border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-border-strong group">
                                                        {/* Prompt Text */}
                                                        <span className="font-medium text-base text-foreground leading-relaxed flex-1">{rowItem.text}</span>

                                                        {/* Answer Slot */}
                                                        <button
                                                            onClick={() => {
                                                                if (activeDropdown) { // activeDropdown here re-purposed as selectedBankItem for minimal diff, or I should just use activeDropdown as the ID holder
                                                                    // Place selected item
                                                                    const newVal = { ...currentVal, [rowItem.id]: activeDropdown.rowId }; // Using rowId property to hold answer ID
                                                                    handleAnswer(newVal, idx);
                                                                    setActiveDropdown(null);
                                                                } else if (matchedAnswerId) {
                                                                    // Remove existing item
                                                                    const newVal = { ...currentVal };
                                                                    delete newVal[rowItem.id];
                                                                    handleAnswer(newVal, idx);
                                                                }
                                                            }}
                                                            className={`
                                                               relative px-5 py-3 rounded-xl border-2 min-w-[240px] md:w-1/2 text-left text-sm font-medium transition-all flex items-center justify-between group-hover:shadow-sm
                                                               ${matchedAnswer
                                                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary border-solid'
                                                                    : activeDropdown
                                                                        ? 'border-brand-primary/50 border-dashed bg-surface-hover text-foreground-secondary cursor-pointer'
                                                                        : 'border-dashed border-border text-foreground-muted bg-surface/50'
                                                                }
                                                           `}
                                                        >
                                                            <span className="truncate pr-2">
                                                                {matchedAnswer ? matchedAnswer.text : (activeDropdown ? "Tap to place answer" : "Select answer from list")}
                                                            </span>
                                                            {matchedAnswer && <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Right Side: Answer Bank */}
                                        <div className="w-full lg:w-80 shrink-0">
                                            <div className="sticky top-8 bg-surface rounded-2xl border border-border p-5 shadow-lg max-h-[calc(100vh-100px)] overflow-y-auto">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-bold text-foreground-secondary uppercase tracking-wider">Answers</h4>
                                                    <button
                                                        onClick={() => handleAnswer({}, idx)}
                                                        className="text-xs text-foreground-muted hover:text-brand-primary transition-colors flex items-center gap-1"
                                                    >
                                                        <RotateCcw className="w-3 h-3" /> Reset
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    {q.shuffledRight?.map(ansItem => {
                                                        const isUsed = Object.values(userAnswers[idx]?.value || {}).includes(ansItem.id);
                                                        // We use activeDropdown state to store the Selected Bank Item ID. 
                                                        // activeDropdown is { qIdx, rowId }. We use rowId to store the Answer ID.
                                                        const isSelected = activeDropdown?.rowId === ansItem.id;

                                                        if (isUsed) return null;

                                                        return (
                                                            <button
                                                                key={ansItem.id}
                                                                onClick={() => setActiveDropdown(isSelected ? null : { qIdx: idx, rowId: ansItem.id })}
                                                                className={`
                                                                    p-4 rounded-xl text-left text-sm font-medium transition-all border shadow-sm
                                                                    ${isSelected
                                                                        ? 'bg-brand-primary text-white border-brand-primary shadow-brand-primary/25 scale-[1.02]'
                                                                        : 'bg-background border-border hover:border-brand-primary/50 hover:bg-surface-hover text-foreground'
                                                                    }
                                                                `}
                                                            >
                                                                {ansItem.text}
                                                            </button>
                                                        )
                                                    })}
                                                    {q.shuffledRight?.every(a => Object.values(userAnswers[idx]?.value || {}).includes(a.id)) && (
                                                        <div className="text-center py-8 text-foreground-muted text-sm italic">
                                                            All items matched! <br /> Review your answers on the left.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                ) : q.type === 'written' ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-foreground-secondary font-medium">Type Your Answer</div>
                                        <div className="relative group">
                                            <textarea
                                                rows={3}
                                                value={userAnswers[idx]?.value || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const newAnswers = { ...userAnswers };
                                                    newAnswers[idx] = { value: val, isCorrect: false };
                                                    setUserAnswers(newAnswers);
                                                }}
                                                className="w-full p-4 bg-transparent border-2 border-border hover:border-border-strong focus:border-brand-primary rounded-lg text-base font-medium text-foreground placeholder-foreground-muted focus:outline-none transition-all resize-none"
                                                placeholder="Type your answer here..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAnswer(userAnswers[idx]?.value || '', idx);
                                                    }
                                                }}
                                            />
                                            <div className="absolute bottom-3 right-3 text-xs font-bold text-foreground-muted pointer-events-none opacity-50">
                                                Press Enter
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-foreground-muted italic">This question type is not fully supported in this view.</div>
                                )}

                                {/* Don't Know / Skipped Status */}
                                <div className="mt-8 flex flex-col items-center justify-center gap-2">
                                    {userAnswers[idx]?.isSkipped ? (
                                        <span className="text-warning font-bold uppercase tracking-wider text-sm bg-warning/10 px-3 py-1 rounded-full">
                                            Skipped
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleSkip(idx)}
                                            className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm hover:underline transition-all"
                                        >
                                            Don't know?
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="w-full max-w-md mx-auto pt-10 pb-20 text-center flex flex-col items-center">
                        <div className="btn-wrapper w-full mb-4">
                            <button
                                onClick={finishTest}
                                className={`btn-custom ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'} w-full h-14 rounded-full text-lg shadow-xl animate-fade-in`}
                            >
                                <span className="btn-text font-bold">Submit Test</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div >

        </div>

    );
}
