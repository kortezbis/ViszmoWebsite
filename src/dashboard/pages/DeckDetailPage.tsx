import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    MoreVertical,
    Plus,
    Play,
    Sparkles,
    Mic,
    BookMarked,
    Podcast,
    Layers,
    FileText,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { useDecks, getDeckCardCount } from '../contexts/DecksContext';
import { db, type FlashcardRow, type LectureNote } from '../../services/database';

type TabId = 'Cards' | 'Lectures' | 'Study Guides' | 'Podcasts';

export default function DeckDetailPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const { getDeckById, setActiveDeck, refreshDecks, deleteDeck, decksLoading } = useDecks();

    const [cards, setCards] = useState<FlashcardRow[]>([]);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('Cards');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [generateMenuOpen, setGenerateMenuOpen] = useState(false);
    
    // Lectures State
    const [lectures, setLectures] = useState<LectureNote[]>([]);
    const [loadingLectures, setLoadingLectures] = useState(false);

    const deck = deckId ? getDeckById(deckId) : undefined;

    // Reset state when deck changes to avoid showing stale data from the previous deck
    useEffect(() => {
        setCards([]);
        setCardsLoading(true);
    }, [deckId]);

    useEffect(() => {
        if (!deckId) return;
        setActiveDeck(deckId);
    }, [deckId, setActiveDeck]);

    const loadCards = useCallback(async () => {
        if (!deckId) return;
        setCardsLoading(true);
        try {
            const rows = await db.getFlashcardsByDeckId(deckId);
            setCards(rows);
        } finally {
            setCardsLoading(false);
        }
    }, [deckId]);

    // Use context cards if available to prevent loading flashes
    useEffect(() => {
        // Only use context cards if they are populated OR the deck is confirmed empty (cardCount 0)
        if (deck && (deck.cards.length > 0 || deck.cardCount === 0)) {
            setCards(deck.cards);
            setCardsLoading(false);
        } else {
            void loadCards();
        }
    }, [deck, loadCards]);

    const loadLectures = useCallback(async () => {
        if (!deckId) return;
        setLoadingLectures(true);
        try {
            // In WebApp-Vis, lectures might be associated with a deck via metadata
            const allLectures = await db.getLectureNotes();
            const deckLectures = allLectures.filter(l => l.flashcardDeckId === deckId);
            setLectures(deckLectures);
        } finally {
            setLoadingLectures(false);
        }
    }, [deckId]);

    useEffect(() => {
        void loadLectures();
    }, [loadLectures]);

    const handleStudyDeck = () => {
        if (!deckId) return;
        navigate(`/dashboard/flashcards?deckId=${encodeURIComponent(deckId)}`);
    };

    const handleDeleteDeck = async () => {
        if (!deckId) return;
        if (window.confirm('Are you sure you want to delete this deck?')) {
            await deleteDeck(deckId);
            navigate('/dashboard/decks');
        }
    };

    if (!deckId || (!deck && (cardsLoading || decksLoading))) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-secondary min-h-[50vh]">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
                <p className="text-sm font-medium">Loading deck…</p>
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-20 px-6">
                <p className="text-foreground-secondary font-medium">Deck not found.</p>
                <button onClick={() => navigate('/dashboard/decks')} className="text-brand-primary font-bold hover:underline">
                    Back to library
                </button>
            </div>
        );
    }

    const nCards = getDeckCardCount(deck);

    return (
        <div 
            className="w-full h-full overflow-y-auto bg-background"
            onClick={() => {
                setIsMenuOpen(false);
                setActiveMenuId(null);
                setGenerateMenuOpen(false);
            }}
        >
            <div className="sticky top-14 md:top-0 z-10 bg-surface">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-surface-hover rounded-full text-foreground transition-all shrink-0 active:scale-90"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div
                                className="w-8 h-8 rounded-full shadow-sm shrink-0"
                                style={{ backgroundColor: '#0EA5E9' }}
                            />
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">{deck.title}</h1>
                                <p className="text-xs text-foreground-secondary font-medium">
                                    {nCards} {nCards === 1 ? 'card' : 'cards'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(!isMenuOpen);
                                    }}
                                    className={`p-2 rounded-full transition-all duration-300 ${
                                        isMenuOpen
                                            ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <MoreVertical size={20} className={isMenuOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 z-50 popover-menu-surface p-1.5 shadow-2xl rounded-xl border border-border bg-surface animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-surface-hover rounded-lg text-left transition-colors"
                                            onClick={() => navigate(`/dashboard/edit-deck/${deckId}`)}
                                        >
                                            <Edit2 size={16} className="text-foreground-secondary" />
                                            Edit cards
                                        </button>
                                        <div className="h-px bg-border my-1 mx-1" />
                                        <button
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-left transition-colors"
                                            onClick={handleDeleteDeck}
                                        >
                                            <Trash2 size={16} />
                                            Delete deck
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setGenerateMenuOpen(!generateMenuOpen);
                                        }}
                                        className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                    {generateMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 z-50 popover-menu-surface p-1.5 shadow-2xl rounded-xl border border-border bg-surface animate-in fade-in zoom-in-95 duration-100">
                                            <p className="px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-foreground-secondary">
                                                Add to this deck
                                            </p>
                                            <button 
                                                className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                                                onClick={() => navigate(`/dashboard/edit-deck/${deckId}`)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                                    <Layers size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-foreground text-sm">Flashcards</span>
                                                    <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                                                        Add cards to this deck
                                                    </span>
                                                </div>
                                            </button>
                                            <button 
                                                className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                                                onClick={() => navigate('/dashboard/transcripts')}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                                    <Mic size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-foreground text-sm">Lecture</span>
                                                    <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                                                        Record and transcribe
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleStudyDeck}
                                    disabled={cards.length === 0}
                                    className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 active:scale-95"
                                >
                                    <Play size={16} className="fill-white" />
                                    Study Deck
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-border w-full">
                    <div className="max-w-4xl mx-auto px-6 flex gap-8">
                        {(['Cards', 'Lectures', 'Study Guides', 'Podcasts'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold transition-all relative ${
                                    activeTab === tab ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-6 pb-40">
                {activeTab === 'Cards' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h2 className="font-bold text-foreground">Cards ({cards.length})</h2>
                            {cards.length > 0 && (
                                <Link to={`/dashboard/edit-deck/${deckId}`} className="text-xs font-bold text-brand-primary hover:underline">
                                    Edit all
                                </Link>
                            )}
                        </div>
                        
                        {cardsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-foreground-muted" />
                                <span className="text-xs font-medium text-foreground-secondary">Loading cards...</span>
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface/50">
                                <h3 className="text-lg font-bold text-foreground mb-2">This deck is empty</h3>
                                <p className="text-foreground-secondary text-sm text-center max-w-sm mb-6">
                                    Add your first flashcards to start studying.
                                </p>
                                <button 
                                    onClick={() => navigate(`/dashboard/edit-deck/${deckId}`)}
                                    className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                                >
                                    <Plus size={18} />
                                    Add Cards
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {cards.map((card, idx) => (
                                    <FadeInUp key={card.id} delay={idx * 0.02}>
                                        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">Front</span>
                                                        <p className="text-sm font-bold text-foreground line-clamp-3">{card.front}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted block mb-1">Back</span>
                                                        <p className="text-sm text-foreground-secondary line-clamp-3 leading-relaxed">{card.back}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === card.id ? null : card.id);
                                                    }}
                                                    className="p-1.5 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-active transition-all"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </FadeInUp>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Lectures' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h2 className="font-bold text-foreground">Lectures ({lectures.length})</h2>
                        </div>
                        
                        {loadingLectures ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-foreground-muted" />
                            </div>
                        ) : lectures.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-3xl bg-surface/50">
                                <h3 className="text-lg font-bold text-foreground mb-2">No lectures for this deck</h3>
                                <p className="text-foreground-secondary text-sm text-center max-w-sm">
                                    Recordings and transcripts linked to this deck will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {lectures.map((lecture) => (
                                    <FadeInUp key={lecture.id}>
                                        <button
                                            onClick={() => navigate(`/dashboard/transcripts/${lecture.id}`)}
                                            className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm w-full text-left"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                                                    <Mic size={20} className="text-brand-primary" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                                                        {lecture.title}
                                                    </h3>
                                                    <div className="text-sm text-foreground-secondary font-medium">
                                                        {lecture.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </FadeInUp>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(activeTab === 'Study Guides' || activeTab === 'Podcasts') && (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface/50 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-surface-active rounded-2xl flex items-center justify-center mb-4">
                            {activeTab === 'Study Guides' ? <BookMarked size={32} className="text-brand-primary" /> : <Podcast size={32} className="text-brand-primary" />}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">No {activeTab} yet</h3>
                        <p className="text-foreground-secondary text-sm max-w-sm mb-6 font-medium">
                            {activeTab === 'Study Guides' ? 'Generate a comprehensive study guide for this deck.' : 'Create an AI-narrated podcast summary.'}
                        </p>
                        <button 
                            className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
                        >
                            <Sparkles size={18} />
                            Generate {activeTab === 'Study Guides' ? 'Guide' : 'Podcast'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
