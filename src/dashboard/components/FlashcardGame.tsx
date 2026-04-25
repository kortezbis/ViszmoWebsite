import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCw, Check, X, Trash2, Star, Volume2, EyeOff, Eye, Minus, Maximize2, Minimize2, Play, Pause, Keyboard } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useDecks } from '../contexts/DecksContext';
import { useStudyProgress, type CardRating } from '../contexts/StudyProgressContext';
import { useSidebar } from '../contexts/SidebarContext';

export function FlashcardGame({
    settings,
    cards,
    onToggleStarred,
    isStarredMode,
    jumpToCardIndex,
    onJumped
}: {
    settings?: any,
    cards: any[],
    onToggleStarred?: (v: boolean) => void,
    isStarredMode?: boolean,
    jumpToCardIndex?: number | null,
    onJumped?: () => void
}) {
    const { updateCard, deleteCard, activeDeck } = useDecks();
    const { updateCardProgress, getCardProgress } = useStudyProgress();
    const { hideSidebar, setHideSidebar } = useSidebar();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSRSMode, setIsSRSMode] = useState(false);
    const [stats, setStats] = useState({ learning: 0, somewhat: 0, known: 0 });
    const [hideDefinitions, setHideDefinitions] = useState(false);
    const [hideTerms, setHideTerms] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    const [interactionCount, setInteractionCount] = useState(0);
    const autoPlayIntervalRef = useRef<any>(null);


    // Handle jump to card index
    useEffect(() => {
        if (jumpToCardIndex !== null && jumpToCardIndex !== undefined && jumpToCardIndex >= 0 && jumpToCardIndex < cards.length) {
            setIsFlipped(false);
            setCurrentIndex(jumpToCardIndex);
            onJumped?.();
        }
    }, [jumpToCardIndex, cards.length, onJumped]);

    // cards is now passed as prop
    const currentCard = cards[currentIndex] || cards[0]; // Fallback if deck empty

    // Safety check for empty deck
    if (!currentCard && cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <h3 className="text-xl font-bold mb-4">No cards in this deck</h3>
                <button
                    onClick={() => navigate(activeDeck ? `/edit-deck/${activeDeck.id}` : '/decks')}
                    className="btn-primary px-6 py-2 rounded-lg"
                >
                    Add Cards
                </button>
            </div>
        );
    }

    const isDefFirst = settings?.studyDirection === 'def-term';
    const frontContent = currentCard ? (isDefFirst ? currentCard.back : currentCard.front) : "";
    const backContent = currentCard ? (isDefFirst ? currentCard.front : currentCard.back) : "";
    const frontLabel = isDefFirst ? "Definition" : "Term";
    const backLabel = isDefFirst ? "Term" : "Definition";

    const handleNext = () => {
        setIsFlipped(false);
        setInteractionCount(prev => prev + 1);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setInteractionCount(prev => prev + 1);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        setInteractionCount(prev => prev + 1);
    };

    const handleRate = (rating: CardRating) => {
        // Update local stats for this session
        setStats(prev => ({
            ...prev,
            learning: rating === 'still-learning' ? prev.learning + 1 : prev.learning,
            somewhat: rating === 'somewhat' ? prev.somewhat + 1 : prev.somewhat,
            known: rating === 'know' ? prev.known + 1 : prev.known
        }));

        // Update spaced repetition progress
        if (activeDeck && currentCard) {
            updateCardProgress(activeDeck.id, currentCard.id, rating);
        }

        handleNext();
    };

    const speak = (text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (settings?.autoAudio && currentCard) {
            const textToSpeak = isDefFirst ? currentCard.back : currentCard.front;
            const timer = setTimeout(() => speak(textToSpeak), 200);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, settings?.autoAudio, isDefFirst, currentCard]);

    // Toggle sidebar for "fullscreen" effect
    const toggleFullscreen = () => {
        setHideSidebar(!hideSidebar);
    };

    // Use hideSidebar state for UI
    const isFullscreen = hideSidebar;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowRight') {
                if (isSRSMode) handleRate('know');
                else handleNext();
            } else if (e.code === 'ArrowLeft') {
                if (isSRSMode) handleRate('still-learning');
                else handlePrev();
            } else if (e.code === 'ArrowDown' && isSRSMode) {
                handleRate('somewhat');
            } else if (e.code === 'KeyF') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, isSRSMode, isFullscreen]);

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayIntervalRef.current = setInterval(() => {
                if (!isFlipped) {
                    setIsFlipped(true);
                } else {
                    handleNext();
                }
            }, 3000); // 3 seconds per side
        } else {
            if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
        }
        return () => {
            if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
        };
    }, [isAutoPlaying, isFlipped]);

    const toggleAutoPlay = () => {
        setIsAutoPlaying(!isAutoPlaying);
    };


    // Get current card's progress for display
    const currentCardProgress = activeDeck && currentCard
        ? getCardProgress(activeDeck.id, currentCard.id)
        : null;

    return (
        <div
            ref={containerRef}
            className={`flex flex-col items-center w-full max-w-6xl mx-auto px-6 relative ${isFullscreen ? 'fixed inset-0 z-[100] bg-background overflow-hidden justify-center pb-24 pt-8' : 'py-8 min-h-full'}`}
        >
            {/* Main Flashcard Section - Takes up full view height */}
            <div className={`w-full flex-1 flex flex-col items-center ${isFullscreen ? 'max-h-full overflow-hidden' : 'mb-32'}`}>
                {/* Top Control Bar */}
                <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
                    {/* Counter */}
                    <div className="text-foreground-secondary font-medium min-w-[100px]">
                        {currentIndex + 1} / {cards.length}
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                        <button
                            onClick={() => setIsSRSMode(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!isSRSMode ? 'bg-brand-primary text-white shadow-md' : 'text-foreground-secondary hover:bg-surface-hover'}`}
                        >
                            Flashcards
                        </button>
                        <button
                            onClick={() => setIsSRSMode(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isSRSMode ? 'bg-brand-primary text-white shadow-md' : 'text-foreground-secondary hover:bg-surface-hover'}`}
                        >
                            Spaced Repetition
                        </button>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2 min-w-[140px] justify-end">
                        <button
                            onClick={toggleAutoPlay}
                            className={`
                                p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-bold uppercase
                                ${isAutoPlaying
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover border border-transparent'
                                }
                            `}
                            title={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
                        >
                            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span>Play</span>
                        </button>

                        <button
                            onClick={() => onToggleStarred?.(!isStarredMode)}
                            className={`
                                p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-bold uppercase
                                ${isStarredMode
                                    ? 'bg-warning/10 text-warning border border-warning/20'
                                    : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover border border-transparent'
                                }
                            `}
                            title={isStarredMode ? "Show All Cards" : "Study Starred Only"}
                        >
                            <Star className={`w-4 h-4 ${isStarredMode ? 'fill-warning' : ''}`} />
                            <span>Starred</span>
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* SRS Progress Indicators - 3 Categories */}
                {isSRSMode && (
                    <div className="w-full max-w-4xl flex justify-between items-end mb-4 px-2 animate-fade-in">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-error uppercase tracking-wider">Still Learning</span>
                            <div className="flex items-center gap-2 text-error font-bold text-xl">
                                <span className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-sm">{stats.learning}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-bold text-warning uppercase tracking-wider">Somewhat</span>
                            <div className="flex items-center gap-2 text-warning font-bold text-xl">
                                <span className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-sm">{stats.somewhat}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs font-bold text-success uppercase tracking-wider">Know</span>
                            <div className="flex items-center gap-2 text-success font-bold text-xl">
                                <span className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-sm">{stats.known}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Card Container */}
                <div className={`relative w-full max-w-4xl perspective-1000 cursor-pointer group ${isFullscreen ? 'h-[70vh] max-h-[800px] mb-8' : 'h-[60vh] min-h-[500px] mb-0'}`}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full relative"
                            onClick={handleFlip}
                        >
                            <motion.div
                                className="w-full h-full relative transform-style-3d"
                                initial={false}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {/* Front of Card */}
                                <div className="absolute inset-0 w-full h-full bg-background-card border border-border rounded-3xl shadow-card hover:shadow-card-hover flex flex-col items-center justify-center p-12 text-center backface-hidden">
                                    { /* Front Side Controls - Both Top Right */}
                                    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                speak(frontContent);
                                            }}
                                            className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors"
                                            title="Listen"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateCard(currentCard.id, { starred: !currentCard.starred });
                                            }}
                                            className="p-2 text-foreground-muted hover:text-warning hover:bg-warning/10 rounded-full transition-colors"
                                            title="Star Card"
                                        >
                                            <Star className={`w-5 h-5 ${currentCard.starred ? 'fill-warning text-warning' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Card Status Badge */}
                                    {currentCardProgress && (
                                        <div className="absolute top-6 left-6">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${currentCardProgress.status === 'mastered' ? 'bg-success/10 text-success' :
                                                currentCardProgress.status === 'reviewing' ? 'bg-brand-primary/10 text-brand-primary' :
                                                    currentCardProgress.status === 'learning' ? 'bg-warning/10 text-warning' :
                                                        'bg-surface text-foreground-muted'
                                                }`}>
                                                {currentCardProgress.status}
                                            </span>
                                        </div>
                                    )}

                                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">{frontLabel}</span>

                                    {currentCard.image && !isDefFirst ? (
                                        <div className="w-full max-h-48 mb-6 rounded-lg overflow-hidden">
                                            <img src={currentCard.image} alt="Card visual" className="w-full h-full object-contain" />
                                        </div>
                                    ) : null}

                                    <h3 className="text-4xl font-bold text-foreground leading-tight">{frontContent}</h3>
                                    <p className="mt-12 text-sm text-foreground-muted flex items-center gap-2">
                                        <RotateCw className="w-4 h-4" /> Click or Space to Flip
                                    </p>
                                </div>

                                {/* Back of Card */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-background-elevated border border-border rounded-3xl shadow-card hover:shadow-card-hover flex flex-col items-center justify-center p-12 text-center backface-hidden"
                                    style={{ transform: "rotateY(180deg)" }}
                                >
                                    { /* Back Side Controls - Both Top Right */}
                                    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                speak(backContent);
                                            }}
                                            className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors"
                                            title="Listen"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateCard(currentCard.id, { starred: !currentCard.starred });
                                            }}
                                            className="p-2 text-foreground-muted hover:text-warning hover:bg-warning/10 rounded-full transition-colors"
                                            title="Star Card"
                                        >
                                            <Star className={`w-5 h-5 ${currentCard.starred ? 'fill-warning text-warning' : ''}`} />
                                        </button>
                                    </div>
                                    <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-4">{backLabel}</span>

                                    {currentCard.image && isDefFirst ? (
                                        <div className="w-full max-h-48 mb-6 rounded-lg overflow-hidden">
                                            <img src={currentCard.image} alt="Card visual" className="w-full h-full object-contain" />
                                        </div>
                                    ) : null}

                                    <p className="text-2xl font-bold text-foreground leading-relaxed">{backContent}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="mt-10 flex items-center gap-4">
                    {isSRSMode ? (
                        <div className="flex gap-4">
                            {/* Still Learning - Red */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('still-learning'); }}
                                className="btn-srs btn-srs-learning"
                                title="Still Learning"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Somewhat - Yellow/Warning */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('somewhat'); }}
                                className="btn-srs btn-srs-somewhat"
                                title="Somewhat"
                            >
                                <Minus className="w-6 h-6" />
                            </button>

                            {/* Know - Green */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('know'); }}
                                className="btn-srs btn-srs-know"
                                title="Know"
                            >
                                <Check className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); setIsAutoPlaying(false); }}
                                className="btn-icon w-14 h-14 p-0 rounded-full border border-border hover:!border-brand-primary hover:!text-brand-primary hover:!bg-transparent flex-shrink-0"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleFlip(); setIsAutoPlaying(false); }}
                                className="btn-custom !h-14 !px-8 !rounded-full !text-lg !min-w-[180px]"
                            >
                                <span className="btn-text">{isFlipped ? 'Flip Back' : 'Show Answer'}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); setIsAutoPlaying(false); }}
                                className="btn-icon w-14 h-14 p-0 rounded-full border border-border hover:!border-brand-primary hover:!text-brand-primary hover:!bg-transparent flex-shrink-0"
                            >
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Hint - Autohides after interaction */}
                <AnimatePresence>
                    {interactionCount < 5 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`flex items-center justify-center w-full mt-6 ${isFullscreen ? 'mb-4' : 'mb-8'}`}
                        >
                            <div className="flex items-center gap-6 px-5 py-2.5 bg-surface/30 backdrop-blur-md rounded-xl border border-border/40 shadow-sm">
                                <Keyboard className="w-4 h-4 text-foreground-muted" />

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <kbd className="min-w-[40px] h-6 flex items-center justify-center px-2 rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm uppercase">Space</kbd>
                                        <span className="text-xs font-medium text-foreground-secondary">Flip</span>
                                    </div>

                                    {isSRSMode ? (
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm font-mono">←</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary">Learning</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm font-mono">↓</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary">Somewhat</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm font-mono">→</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary">Know</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm font-mono">←</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary">Prev</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm font-mono">→</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary">Next</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <kbd className="w-6 h-6 flex items-center justify-center rounded-md bg-background border-b-2 border-border-strong text-[10px] font-black shadow-sm">F</kbd>
                                                <span className="text-xs font-medium text-foreground-secondary px-0">Fullscreen</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {
                !isFullscreen && (
                    <>
                        {/* Terms List - Quizlet Style */}
                        <div className="w-full max-w-4xl px-4 mt-20 mb-20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-foreground">Terms in this set ({cards.length})</h3>
                                <button
                                    onClick={() => navigate(activeDeck ? `/edit-deck/${activeDeck.id}` : '/decks')}
                                    className="btn-outline text-sm py-2 px-4 rounded-lg"
                                >
                                    Add or Remove Terms
                                </button>
                            </div>

                            <div className="space-y-4">
                                {cards.map((card) => {
                                    const cardProg = activeDeck ? getCardProgress(activeDeck.id, card.id) : null;
                                    return (
                                        <div key={card.id} className="bg-background-card border border-border rounded-xl p-6 shadow-sm hover:shadow-card-hover transition-all duration-200">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Term</span>
                                                        {cardProg && (
                                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cardProg.status === 'mastered' ? 'bg-success/10 text-success' :
                                                                cardProg.status === 'reviewing' ? 'bg-brand-primary/10 text-brand-primary' :
                                                                    cardProg.status === 'learning' ? 'bg-warning/10 text-warning' :
                                                                        'bg-surface text-foreground-muted'
                                                                }`}>
                                                                {cardProg.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-foreground leading-relaxed font-medium transition-all duration-300 ${hideTerms ? 'blur-sm select-none' : ''}`}>{card.front}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">Definition</span>
                                                    <div className="flex items-start gap-4">
                                                        {card.image && (
                                                            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border">
                                                                <img src={card.image} alt="term" className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <p className={`text-foreground-secondary leading-relaxed transition-all duration-300 ${hideDefinitions ? 'blur-sm select-none' : ''}`}>{card.back}</p>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col gap-2 justify-end">
                                                    <button
                                                        onClick={() => navigate(activeDeck ? `/edit-deck/${activeDeck.id}` : '/decks')}
                                                        className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => updateCard(card.id, { starred: !card.starred })}
                                                        className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Star"
                                                    >
                                                        <Star className={`w-[18px] h-[18px] ${card.starred ? 'fill-warning text-warning' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => void deleteCard(card.id)}
                                                        className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete"
                                                    >
                                                        <Trash2 className="w-[18px] h-[18px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-24 mb-32 flex justify-center w-full">
                                <div className="flex items-center bg-background-elevated border border-border p-1.5 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-200">
                                    <button
                                        onClick={() => setHideDefinitions(!hideDefinitions)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-foreground font-bold text-sm hover:bg-surface transition-colors"
                                    >
                                        {hideDefinitions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        {hideDefinitions ? 'Show Definitions' : 'Hide Definitions'}
                                    </button>
                                    <div className="w-px h-8 bg-border mx-1"></div>
                                    <button
                                        onClick={() => setHideTerms(!hideTerms)}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-brand-primary/90 transition-colors"
                                    >
                                        {hideTerms ? 'Show Terms' : 'Hide Terms'}
                                        {hideTerms ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

        </div >

    );
}
