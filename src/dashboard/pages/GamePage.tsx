import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Settings,
    ChevronDown,
    Zap,
    Puzzle,
    PenTool,
    Mic,
    ClipboardCheck,
    Layers,
    BrainCircuit
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useDecks } from '../contexts/DecksContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDebug } from '../contexts/DebugContext';
import { SettingsModal } from '../components/SettingsModal';
import { CreateModal } from '../components/CreateModal';
import { FlashcardGame } from '../components/FlashcardGame';
import { RapidFireQuiz } from '../components/RapidFireQuiz';
import { MatchGame } from '../components/MatchGame';
import { WrittenGame } from '../components/WrittenGame';
import { SpeakingGame } from '../components/SpeakingGame';
import { TestGame } from '../components/TestGame';
import { LearnMode } from '../components/learn-mode/LearnMode';
import { FadeInUp } from '../components/ui/MotionWrapper';


const GAME_MODES = [
    { name: 'Flashcards', icon: Layers, image: '/dashimages/flashcard.png.png', color: 'text-blue-400', path: '/dashboard/flashcards' },
    { name: 'Learn', icon: BrainCircuit, image: '/dashimages/guide.png.png', color: 'text-brand-primary', path: '/dashboard/learn' },
    { name: 'Rapid Fire', icon: Zap, image: '/dashimages/hotdeal.png.png', color: 'text-yellow-400', path: '/dashboard/quiz' },
    { name: 'Matching', icon: Puzzle, image: '/dashimages/puzzle.png.png', color: 'text-green-400', path: '/dashboard/match' },
    { name: 'Written', icon: PenTool, image: '/dashimages/writing.png.png', color: 'text-purple-400', path: '/dashboard/written' },
    { name: 'Speaking Drill', icon: Mic, image: '/dashimages/speech.png.png', color: 'text-red-400', path: '/dashboard/speaking' },
    { name: 'Practice Test', icon: ClipboardCheck, image: '/dashimages/test.png.png', color: 'text-orange-400', path: '/dashboard/test' },
];

const CONTENT: Record<string, { title: string; description: string; buttonText: string }> = {
    'Flashcards': {
        title: "Ready to review?",
        description: "Go through your flashcards one by one. Flip them to see the answer and rate your memory.",
        buttonText: "Start Session"
    },
    'Learn': {
        title: "Ready to master?",
        description: "An adaptive 3-round course that teaches you concepts using AI-powered explanations and multiple question types.",
        buttonText: "Start Learning"
    },
    'Rapid Fire': {
        title: "Ready to quiz?",
        description: "Answer questions at a rapid pace to test your quick recall abilities.",
        buttonText: "Start Quiz"
    },
    'Matching': {
        title: "Ready to play?",
        description: "Match all the terms with their definitions as fast as you can. Avoid wrong matches, they add extra time!",
        buttonText: "Start Game"
    },
    'Written': {
        title: "Ready to write?",
        description: "Type the answers to test your full recall of the material without hints.",
        buttonText: "Start Writing"
    },
    'Speaking Drill': {
        title: "Ready to speak?",
        description: "Practice your pronunciation and verbal recall by speaking the answers aloud.",
        buttonText: "Start Speaking"
    },
    'Practice Test': {
        title: "Ready for the exam?",
        description: "Simulate a real exam environment with timed questions and no immediate feedback.",
        buttonText: "Start Test"
    }
};

const SUB_MODES: Record<string, Array<{ id: string, title: string, description: string }>> = {
    'Written': [
        { id: 'basic', title: 'Standard Write', description: 'Type the full answer to test your recall.' },
        { id: 'word-reveal', title: 'Word Reveal', description: 'Hangman-style game where you guess letters to reveal the answer.' }
    ]
};

const DEFAULT_SETTINGS = {
    enableTimer: false,
    cardLimit: 9999,
    soundEffects: false,
    studyDirection: 'term-def',
    subMode: 'basic',
    questionFocus: 'term',
    choiceCount: 4,
    timer: 15,
    matchDepth: '2-way',
    decaySpeed: 'normal',
    gravityLoop: false,
    gravitySpeed: 'normal',
    gravityLives: 3,
    scenarioMix: 30,
    explosionFX: false,
    memoryMode: false,
    similarityThreshold: 85,
    instantFeedback: false,
    autoSanitize: false,
    autoAdvance: false,
    testLength: 20,
    sourceLogic: 'all',
    allowBacktracking: false,
    answerFormat: 'both',
    autoAudio: false,
    shuffle: false,
    smartSort: false,
    favoritesOnly: false,
    includeTF: false,
    includeMCQ: false,
    includeWritten: false,
    includeCase: false,
    includeMatching: false,
    showStreakFx: true
};

interface GamePageProps {
    initialModeName: string;
}

export default function GamePage({ initialModeName }: GamePageProps) {
    const navigate = useNavigate();
    const { setHideSidebar } = useSidebar();
    const { decks, setActiveDeck, activeDeck } = useDecks();
    const { debugEmpty } = useDebug();
    const { getDueCards, getNewCards, getDeckStats } = useStudyProgress();
    const { resolvedTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(false);
    const [gameSettings, setGameSettings] = useState(DEFAULT_SETTINGS);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [reviewDueOnly, setReviewDueOnly] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);
    const [jumpToCardIndex, setJumpToCardIndex] = useState<number | null>(null);

    // Use activeDeck or empty fallback
    const rawDeck = activeDeck || { id: 'none', title: 'No Deck Selected', cards: [], color: 'bg-gray-500' };
    const deck = debugEmpty ? { ...rawDeck, cards: [] } : rawDeck;

    useEffect(() => {
        setHideSidebar(isGameStarted);
        return () => setHideSidebar(false);
    }, [isGameStarted, setHideSidebar]);

    // Find the full mode object based on the name passed
    const currentMode = GAME_MODES.find(m => m.name === initialModeName) || GAME_MODES[0];
    const content = CONTENT[currentMode.name];

    // Reset game state when mode changes
    useEffect(() => {
        setIsGameStarted(false);
        setIsModeSelectionOpen(false);

        // Auto-enable timer for Rapid Fire
        if (currentMode.name === 'Rapid Fire') {
            setGameSettings(prev => ({ ...prev, enableTimer: true }));
        }
    }, [currentMode.name]);

    const handleStartClick = () => {
        setIsGameStarted(true);
    };

    const processedCards = useMemo(() => {
        if (!deck || !deck.cards) return [];
        let cards = [...deck.cards];

        // 1. Filter by Favorites
        if (gameSettings.favoritesOnly) {
            cards = cards.filter(c => c.starred);
        }

        // 1.5 Filter by Due Cards (Review Due mode)
        if (reviewDueOnly && activeDeck) {
            const allCardIds = cards.map(c => c.id);
            const dueCardIds = getDueCards(activeDeck.id, allCardIds);
            const newCardIds = getNewCards(activeDeck.id, allCardIds);
            // Include both due cards AND new cards in review mode
            const reviewCardIds = new Set([...dueCardIds, ...newCardIds]);
            cards = cards.filter(c => reviewCardIds.has(c.id));
        }

        // 2. Map to Game Format
        let mappedCards = cards.map(c => ({
            ...c,
            term: c.front,
            definition: c.back,
            id: c.id,
            case: '' // Future proofing
        }));

        // 3. Smart Sort (for Flashcards mode) - Prioritize frequently missed cards
        if (currentMode.name === 'Flashcards' && gameSettings.smartSort) {
            try {
                const learningStats = JSON.parse(localStorage.getItem('studylayer_learning_stats') || '{}');
                mappedCards = mappedCards.sort((a, b) => {
                    const aLearning = learningStats[a.id]?.learningCount || 0;
                    const bLearning = learningStats[b.id]?.learningCount || 0;
                    return bLearning - aLearning; // Higher learning count = more priority
                });
            } catch (e) {
                console.warn('Failed to load learning stats for Smart Sort');
            }
        }

        // 4. Shuffle (if applicable, but not for Smart Sort mode)
        const shouldShuffle = (gameSettings.shuffle && !(currentMode.name === 'Flashcards' && gameSettings.smartSort)) ||
            ['Rapid Fire', 'Matching', 'Gravity', 'Written'].includes(currentMode.name);

        if (shouldShuffle) {
            mappedCards = mappedCards.sort(() => Math.random() - 0.5);
        }

        // 5. Limits
        let limit = gameSettings.cardLimit || deck.cards.length;

        // Special Limit for Speaking Drill
        if (currentMode.name === 'Speaking Drill') {
            limit = Math.min(limit, 30);
        }

        return mappedCards.slice(0, limit);
    }, [deck.cards, gameSettings, reviewDueOnly, currentMode.name, activeDeck?.id]);

    const renderGame = () => {
        const cards = processedCards;

        if (cards.length === 0) {
            // Check if reason is EMPTY DECK vs FILTER
            if (deck.cards.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-2">This deck is empty</h2>
                        <p className="text-foreground-secondary mb-6 max-w-sm">
                            You need to add some cards before you can start studying with {currentMode.name}.
                        </p>
                        <div className="btn-wrapper">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className={`btn-custom px-8 py-3 ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'}`}
                            >
                                <span className="btn-text">Create Flashcards</span>
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="text-xl font-bold mb-4">No cards found matching your criteria.</p>
                    <button
                        onClick={() => setGameSettings({ ...gameSettings, favoritesOnly: false })}
                        className="text-brand-primary underline"
                    >
                        Clear Filters
                    </button>
                </div>
            );
        }

        if (currentMode.name === 'Flashcards') {
            return (
                <FlashcardGame
                    settings={gameSettings}
                    cards={cards}
                    isStarredMode={gameSettings.favoritesOnly}
                    onToggleStarred={(val) => setGameSettings({ ...gameSettings, favoritesOnly: val })}
                    jumpToCardIndex={jumpToCardIndex}
                    onJumped={() => setJumpToCardIndex(null)}
                />
            );
        }
        if (currentMode.name === 'Learn') {
            return (
                <LearnMode
                    cards={cards}
                    settings={{
                        autoPlayAudio: gameSettings.autoAudio,
                        explanationStyle: 'eli5',
                        testMode: true // Enabled for dev as requested
                    }}
                    onComplete={(results) => {
                        console.log('Learn Mode Complete', results);
                        // SRM Update Logic
                        try {
                            const stats = JSON.parse(localStorage.getItem('studylayer_learning_stats') || '{}');
                            results.forEach(card => {
                                stats[card.id] = {
                                    ...(stats[card.id] || {}),
                                    mastery: card.mastery > 0 ? 1 : 0,
                                    lastSeen: new Date().toISOString(),
                                    learningCount: (stats[card.id]?.learningCount || 0) + 1
                                };
                            });
                            localStorage.setItem('studylayer_learning_stats', JSON.stringify(stats));
                        } catch (e) {
                            console.error('Failed to update SRM', e);
                        }
                    }}
                    onExit={() => setIsGameStarted(false)}
                />
            );
        }
        if (currentMode.name === 'Rapid Fire') {
            return <RapidFireQuiz settings={gameSettings} cards={cards} />;
        }
        if (currentMode.name === 'Matching') {
            return <MatchGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Written') {
            return <WrittenGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Speaking Drill') {
            return <SpeakingGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Practice Test') {
            return <TestGame settings={gameSettings as any} cards={cards} />;
        }
        return null;
    };

    return (
        <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col" onClick={() => {
            setIsDropdownOpen(false);
            setIsDeckDropdownOpen(false);
        }}>
            {/* Header */}
            <header className="h-16 px-8 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                {/* Left: Module Dropdown */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-2 cursor-pointer text-foreground hover:text-foreground-secondary transition-colors font-bold text-sm"
                    >
                        <img src={currentMode.image} alt={currentMode.name} className="w-5 h-5 object-contain" />
                        <span>{currentMode.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: -20, y: -20 }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: -20, y: -20 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 origin-top-left"
                            >
                                <div className="space-y-0.5">
                                    {GAME_MODES.filter(m => m.name !== 'Transcripts').map((mode) => (
                                        <button
                                            key={mode.name}
                                            onClick={() => {
                                                navigate(mode.path);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentMode.name === mode.name ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                                        >
                                            <img src={mode.image} alt={mode.name} className="w-5 h-5 object-contain" />
                                            <span>{mode.name}</span>
                                            {currentMode.name === mode.name && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                            )}
                                        </button>
                                    ))}

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1"></div>

                                    <Link
                                        to="/"
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <span>Back to Dashboard</span>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center: Title & Deck Switcher */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeckDropdownOpen(!isDeckDropdownOpen);
                                setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-surface-hover transition-all group"
                        >
                            <h1 className="font-bold text-base text-foreground tracking-tight group-hover:text-brand-primary transition-colors">{deck.title}</h1>
                            <ChevronDown className={`w-4 h-4 text-foreground-muted group-hover:text-brand-primary transition-all duration-300 ${isDeckDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Deck Dropdown Menu */}
                        {isDeckDropdownOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-background-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in dropdown-menu">
                                <div className="max-h-[400px] overflow-y-auto p-1.5 scrollbar-hide">
                                    <div className="space-y-0.5">
                                        {decks.filter(d => !d.isDeleted).map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => {
                                                    setActiveDeck(d.id);
                                                    setIsDeckDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${d.id === deck.id ? 'bg-brand-primary/10' : 'hover:bg-surface-hover'}`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${d.id === deck.id ? 'text-brand-primary' : 'text-foreground'}`}>{d.title}</p>
                                                    <p className="text-[10px] text-foreground-secondary">{d.cards.length} cards</p>
                                                </div>
                                                {d.id === deck.id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {/* Review Due Toggle - Only show for Flashcards mode */}
                    {currentMode.name === 'Flashcards' && activeDeck && (
                        <button
                            onClick={() => setReviewDueOnly(!reviewDueOnly)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${reviewDueOnly
                                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover border border-transparent'
                                }`}
                            title={reviewDueOnly ? "Showing only due cards" : "Show due cards only"}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${reviewDueOnly ? 'bg-brand-primary text-white' : 'bg-surface-active text-foreground-muted'
                                }`}>
                                {getDeckStats(activeDeck.id, deck.cards.length).dueToday + getDeckStats(activeDeck.id, deck.cards.length).newCards}
                            </span>
                            <span className="hidden sm:inline">Review Due</span>
                        </button>
                    )}
                    {currentMode.name !== 'Transcripts' && currentMode.name !== 'Learn' && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    <Link
                        to="/"
                        className="w-10 h-10 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            {isGameStarted || currentMode.name === 'Flashcards' ? (
                <main className={`flex-1 w-full bg-background relative flex flex-col min-h-0 ${['Matching', 'Gravity', 'Canvas'].includes(currentMode.name) ? 'overflow-hidden' : 'overflow-y-auto'} ${!['Flashcards', 'Matching', 'Practice Test', 'Speaking Drill', 'Canvas'].includes(currentMode.name) ? 'items-center justify-center' : ''}`}>
                    {renderGame()}
                </main>
            ) : (
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
                    <div className="w-full flex flex-col items-center">
                        {/* Illustration */}
                        <FadeInUp delay={0.1}>
                            <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full"></div>
                                <img
                                    src={currentMode.image}
                                    alt={currentMode.name}
                                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </FadeInUp>

                        <FadeInUp delay={0.2}>
                            <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
                        </FadeInUp>

                        <FadeInUp delay={0.3}>
                            <p className="text-foreground-secondary mb-10 max-w-md leading-relaxed">
                                {content.description}
                            </p>
                        </FadeInUp>

                        <FadeInUp delay={0.4} className="w-full max-w-md">
                            <div className="btn-wrapper mb-4 w-full">
                                <button
                                    onClick={handleStartClick}
                                    className={`btn-custom w-full h-14 rounded-full text-lg shadow-xl ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'}`}
                                >
                                    <span className="btn-text">{content.buttonText}</span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                {currentMode.name !== 'Learn' && (
                                    <button onClick={() => setIsSettingsOpen(true)} className="btn-liquid">
                                        <div className="button-outer">
                                            <div className="button-inner">
                                                <Settings className="w-4 h-4 mr-2" />
                                                <span>Options</span>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </FadeInUp>
                    </div>
                </main>
            )}
            {/* Mode Selection Modal */}
            {isModeSelectionOpen && SUB_MODES[currentMode.name] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModeSelectionOpen(false)}>
                    <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl shadow-2xl p-8 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsModeSelectionOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-black mb-2 text-center text-foreground">Select Mode</h2>
                        <p className="text-foreground-secondary text-center mb-10 max-w-lg mx-auto">Choose how you want to play {currentMode.name}.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {SUB_MODES[currentMode.name].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setGameSettings(prev => ({ ...prev, subMode: mode.id }));
                                        setIsModeSelectionOpen(false);
                                        setIsGameStarted(true);
                                    }}
                                    className="group relative flex flex-col items-start p-6 rounded-2xl bg-background-elevated border border-border hover:border-brand-primary/50 hover:bg-surface-hover hover:scale-[1.02] transition-all duration-300 text-left"
                                >
                                    <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-brand-primary transition-colors">{mode.title}</h3>
                                    <p className="text-sm text-foreground-secondary leading-relaxed">{mode.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                mode={currentMode.name}
                description={content.description}
                currentSettings={gameSettings}
                onSave={(s) => setGameSettings(s as any)}
                maxCards={deck.cards.length}
            />
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
