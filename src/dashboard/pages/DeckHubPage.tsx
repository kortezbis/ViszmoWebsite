import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, ArrowRight, RotateCw, Play, Volume2, Star, Maximize2, 
    Layers, Brain, BrainCircuit, Zap, Puzzle, PenTool, Mic, ClipboardCheck, Clock,
    ChevronLeft, ChevronRight, Settings, MoreVertical, Share2, Plus, GripVertical,
    Trash2, Edit, X, Eye, EyeOff
} from 'lucide-react';
import { useDecks } from '../contexts/DecksContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { db, type FlashcardRow } from '../../services/database';
import { CreateModal } from '../components/CreateModal';

const GAME_MODES = [
    { name: 'Flashcards', image: '/dashimages/branding/gamemodes/flashcard.png', color: 'text-blue-400', path: '/dashboard/flashcards' },
    { name: 'Learn', image: '/dashimages/branding/gamemodes/learn.png', color: 'text-brand-primary', path: '/dashboard/learn' },
    { name: 'Practice Test', image: '/dashimages/branding/gamemodes/test.png', color: 'text-orange-400', path: '/dashboard/test' },
    { name: 'Matching', image: '/dashimages/branding/gamemodes/puzzle.png', color: 'text-green-400', path: '/dashboard/match' },
    { name: 'Rapid Fire', image: '/dashimages/branding/gamemodes/hotdeal.png', color: 'text-yellow-400', path: '/dashboard/quiz' },
    { name: 'Written', image: '/dashimages/branding/gamemodes/writing.png', color: 'text-purple-400', path: '/dashboard/written' },
    { name: 'Speaking Drill', image: '/dashimages/branding/gamemodes/speech.png', color: 'text-red-400', path: '/dashboard/speaking' }
];

export default function DeckHubPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deckId');
    const workspaceId = searchParams.get('workspaceId');
    
    const { getDeckById, workspaces, decks, updateCard, updateDeckTitle } = useDecks();
    const { getCardProgress } = useStudyProgress();
    
    const [cards, setCards] = useState<FlashcardRow[]>([]);
    const [title, setTitle] = useState('Loading...');
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddTerm, setQuickAddTerm] = useState({ front: '', back: '' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<FlashcardRow | null>(null);
    const [hideDefinitions, setHideDefinitions] = useState(false);
    const [hideTerms, setHideTerms] = useState(false);
    
    // Viewer State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const lastLoadedId = useRef<string | null>(null);

    const handleFullscreen = () => {
        if (!cardRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            cardRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    // Auto-play logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && cards.length > 0) {
            timer = setInterval(() => {
                if (isFlipped) {
                    setIsFlipped(false);
                    setTimeout(handleNext, 600);
                } else {
                    setIsFlipped(true);
                }
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, isFlipped, cards.length]);

    const breadcrumbPath = useMemo(() => {
        const path = ['Library'];
        if (deckId) {
            const d = getDeckById(deckId);
            if (d) {
                const ws = workspaces.find(w => w.id === d.workspaceId);
                if (ws) {
                    if (ws.parentId) {
                        const parent = workspaces.find(p => p.id === ws.parentId);
                        if (parent) path.push(parent.name);
                    }
                    path.push(ws.name);
                }
                path.push(d.title);
            } else {
                path.push(title);
            }
        } else if (workspaceId) {
            const ws = workspaces.find(w => w.id === workspaceId);
            if (ws) {
                if (ws.parentId) {
                    const parent = workspaces.find(p => p.id === ws.parentId);
                    if (parent) path.push(parent.name);
                }
                path.push(ws.name);
            } else {
                path.push(title);
            }
        }
        return path;
    }, [deckId, workspaceId, title, workspaces, getDeckById]);


    // Update title instantly from local state if available
    useEffect(() => {
        if (deckId) {
            const d = getDeckById(deckId);
            if (d) setTitle(d.title);
        } else if (workspaceId) {
            const ws = workspaces.find(w => w.id === workspaceId);
            if (ws) setTitle(ws.name);
        }
    }, [deckId, workspaceId, getDeckById, workspaces]);
    
    useEffect(() => {
        const targetId = deckId || workspaceId;
        if (!targetId) return;
        if (targetId === lastLoadedId.current && cards.length > 0) return;
        
        let isMounted = true;
        const loadData = async () => {
            setCardsLoading(true);
            try {
                if (deckId) {
                    const d = getDeckById(deckId);
                    if (d && d.cards && d.cards.length > 0) {
                        setCards(d.cards);
                        lastLoadedId.current = deckId;
                        setCardsLoading(false);
                        return;
                    }
                    const rows = await db.getFlashcardsByDeckId(deckId);
                    if (isMounted) {
                        setCards(rows);
                        lastLoadedId.current = deckId;
                    }
                } else if (workspaceId) {
                    const getWorkspaceDecks = (wsId: string): typeof decks => {
                        const directDecks = decks.filter(d => d.workspaceId === wsId && !d.isDeleted);
                        const subWs = workspaces.filter(w => w.parentId === wsId);
                        return directDecks.concat(subWs.flatMap(w => getWorkspaceDecks(w.id)));
                    };
                    const allDecks = getWorkspaceDecks(workspaceId);
                    const deckIds = allDecks.map(d => d.id);
                    
                    if (deckIds.length > 0) {
                        const cardsMap = await db.getFlashcardsByDeckIds(deckIds);
                        if (isMounted) {
                            const allCards = Object.values(cardsMap).flat();
                            setCards(allCards);
                            lastLoadedId.current = workspaceId;
                        }
                    } else if (isMounted) {
                        setCards([]);
                        lastLoadedId.current = workspaceId;
                    }
                }
            } catch (error) {
                console.error("Failed to load cards", error);
            } finally {
                if (isMounted) setCardsLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [deckId, workspaceId, decks, workspaces]);
    
    const speak = (text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const currentCard = cards[currentIndex];

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(p => (p + 1) % (cards.length || 1)), 150);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(p => (p - 1 + (cards.length || 1)) % (cards.length || 1)), 150);
    };

    const handleFlip = () => setIsFlipped(!isFlipped);
    
    const navigateToMode = (path: string) => {
        const params = new URLSearchParams();
        if (deckId) params.set('deckId', deckId);
        if (workspaceId) params.set('workspaceId', workspaceId);
        navigate(`${path}?${params.toString()}`);
    };

    const handleDeleteCard = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;
        try {
            await db.deleteFlashcard(id);
            setCards(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    const handleQuickAdd = async () => {
        if (!quickAddTerm.front.trim() || !quickAddTerm.back.trim()) return;
        if (!deckId) return;
        try {
            const newCard = await db.addFlashcard(deckId, quickAddTerm.front, quickAddTerm.back);
            setCards(prev => [...prev, newCard]);
            setQuickAddTerm({ front: '', back: '' });
            setIsQuickAddOpen(false);
        } catch (error) {
            console.error('Failed to add card:', error);
        }
    };

    const handleUpdateCard = async () => {
        if (!editingCard) return;
        try {
            await db.updateFlashcard(editingCard.id, {
                front: editingCard.front,
                back: editingCard.back
            });
            setCards(prev => prev.map(c => c.id === editingCard.id ? editingCard : c));
            setIsEditModalOpen(false);
            setEditingCard(null);
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const handleToggleStar = async (cardId: string, starred: boolean) => {
        try {
            await db.updateFlashcard(cardId, { starred });
            setCards(prev => prev.map(c => c.id === cardId ? { ...c, starred } : c));
            updateCard(cardId, { starred });
        } catch (error) {
            console.error('Failed to toggle star:', error);
        }
    };

    const handleRenameDeck = async () => {
        if (!deckId || !newTitle.trim()) return;
        try {
            await updateDeckTitle(newTitle);
            setTitle(newTitle);
            setIsRenaming(false);
        } catch (error) {
            console.error('Failed to rename deck:', error);
        }
    };

    const handleDeleteDeck = async () => {
        if (!deckId || !window.confirm('Are you sure you want to delete this deck? This cannot be undone.')) return;
        try {
            await db.deleteDeck(deckId);
            navigate('/dashboard/decks');
        } catch (error) {
            console.error('Failed to delete deck:', error);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-background text-foreground relative">
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground-secondary opacity-60 leading-none mb-1">
                            {breadcrumbPath.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className={idx === breadcrumbPath.length - 1 ? 'text-foreground' : ''}>{item}</span>
                                    {idx < breadcrumbPath.length - 1 && <ChevronRight size={10} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 hover:bg-surface-hover rounded-xl text-foreground-secondary transition-all"><Share2 size={20} /></button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 hover:bg-surface-hover rounded-xl text-foreground-secondary transition-all"
                        >
                            <MoreVertical size={20} />
                        </button>
                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-2xl shadow-2xl z-20 overflow-hidden"
                                    >
                                        <button 
                                            onClick={() => { setIsRenaming(true); setNewTitle(title); setIsMenuOpen(false); }}
                                            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-surface-hover flex items-center gap-3"
                                        >
                                            <Edit size={16} />
                                            <span>Rename Deck</span>
                                        </button>
                                        <button 
                                            onClick={handleDeleteDeck}
                                            className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-surface-hover text-red-500 flex items-center gap-3"
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete Deck</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-12" onClick={() => setIsMenuOpen(false)}>
                <div className="mb-12">
                    {isRenaming ? (
                        <div className="flex items-center gap-4">
                            <input 
                                autoFocus
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleRenameDeck();
                                    if (e.key === 'Escape') setIsRenaming(false);
                                }}
                                onBlur={handleRenameDeck}
                                className="text-4xl font-black tracking-tight bg-transparent outline-none w-full border-none focus:ring-0 p-0 mb-2"
                                placeholder="Enter title..."
                            />
                        </div>
                    ) : (
                        <h2 
                            onClick={() => { setIsRenaming(true); setNewTitle(title); }}
                            className="text-4xl font-black tracking-tight mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {title}
                        </h2>
                    )}
                    <div className="flex items-center gap-4 text-sm font-bold text-foreground-secondary">
                        <div className="flex items-center gap-1.5">
                            <Layers size={16} />
                            <span>{cards.length} Flashcards</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                            <Star size={16} className="text-warning fill-warning/20" />
                            <span>0 Starred</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
                    {GAME_MODES.map((mode) => (
                        <button
                            key={mode.name}
                            onClick={() => navigateToMode(mode.path)}
                            className="group flex items-center gap-4 px-4 py-3 bg-surface border border-border rounded-2xl hover:border-brand-primary transition-all hover:shadow-xl hover:shadow-brand-primary/5 text-left"
                        >
                            <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <img src={mode.image} alt={mode.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors text-base">{mode.name}</h3>
                            </div>
                            <ArrowRight size={18} className="text-zinc-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>

                {(cardsLoading && cards.length === 0) ? (
                    <div className="w-full mb-16">
                        <div className="w-full h-[600px] bg-surface/50 border border-border rounded-[2.5rem] flex items-center justify-center animate-pulse">
                            <div className="flex flex-col items-center gap-4">
                                <RotateCw className="animate-spin text-brand-primary/40" size={40} />
                                <span className="text-sm font-bold text-foreground-secondary tracking-widest uppercase">Loading cards...</span>
                            </div>
                        </div>
                    </div>
                ) : cards.length > 0 && currentCard ? (
                    <div className="relative mb-24" ref={cardRef}>
                        <div 
                            className="relative w-full aspect-[16/9] perspective-1000 group/card bg-background-elevated rounded-[2.5rem]"
                            onClick={handleFlip}
                        >    <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: isFlipped ? 180 : 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    transition={{ 
                                        rotateX: { duration: 0.4, ease: "circOut" },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.2 }
                                    }}
                                    className="w-full h-full relative transform-style-3d"
                                >
                                    {/* Front */}
                                    <div className="absolute inset-0 w-full h-full bg-background-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-16 text-center backface-hidden hover:border-brand-primary/20 transition-all duration-500">
                                        <div className="absolute top-8 right-8 flex gap-3 z-10">
                                            <button className="p-3 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all" onClick={(e) => { e.stopPropagation(); speak(currentCard.front); }}>
                                                <Volume2 size={24} />
                                            </button>
                                            <button className="p-3 text-foreground-muted hover:text-warning hover:bg-warning/10 rounded-2xl transition-all" onClick={(e) => { e.stopPropagation(); updateCard(currentCard.id, { starred: !currentCard.starred }); }}>
                                                <Star size={24} className={currentCard.starred ? 'fill-warning text-warning' : ''} />
                                            </button>
                                        </div>
                                        <h3 className="text-5xl font-bold leading-tight max-w-2xl">{currentCard.front}</h3>
                                        <div className="mt-12 flex items-center gap-2 text-foreground-muted opacity-40 group-hover/card:opacity-100 transition-opacity">
                                            <RotateCw size={14} className="animate-spin-slow" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Click to flip</span>
                                        </div>
                                    </div>
                                    
                                    {/* Back */}
                                    <div className="absolute inset-0 w-full h-full bg-background-elevated border border-border rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-16 text-center backface-hidden transition-all duration-500" style={{ transform: "rotateX(180deg)" }}>
                                        <div className="absolute top-8 right-8 flex gap-3 z-10">
                                            <button className="p-3 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all" onClick={(e) => { e.stopPropagation(); speak(currentCard.back); }}>
                                                <Volume2 size={24} />
                                            </button>
                                            <button className="p-3 text-foreground-muted hover:text-warning hover:bg-warning/10 rounded-2xl transition-all" onClick={(e) => { e.stopPropagation(); updateCard(currentCard.id, { starred: !currentCard.starred }); }}>
                                                <Star size={24} className={currentCard.starred ? 'fill-warning text-warning' : ''} />
                                            </button>
                                        </div>
                                        <p className="text-3xl font-bold leading-relaxed max-w-2xl whitespace-pre-wrap">{currentCard.back}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <div className="flex items-center justify-between mt-10">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`p-2 transition-colors ${isPlaying ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                                >
                                    <Play size={20} className={isPlaying ? 'fill-brand-primary' : ''} />
                                </button>
                                <button onClick={handleFullscreen} className="p-2 text-foreground-muted hover:text-foreground transition-colors"><Maximize2 size={20} /></button>
                                <button className="p-2 text-foreground-muted hover:text-foreground transition-colors"><Settings size={20} /></button>
                            </div>
                            
                            <div className="flex gap-8 items-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className="btn-icon w-12 h-12 p-0 rounded-full border border-border hover:!border-brand-primary hover:!text-brand-primary hover:!bg-transparent flex-shrink-0 transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <div className="text-foreground font-black text-xl min-w-[80px] text-center tracking-tight">
                                    {currentIndex + 1} <span className="opacity-20 mx-1">/</span> {cards.length}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="btn-icon w-12 h-12 p-0 rounded-full border border-border hover:!border-brand-primary hover:!text-brand-primary hover:!bg-transparent flex-shrink-0 transition-all"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="w-[120px]" /> 
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl mb-16">
                        <h3 className="text-lg font-bold mb-2 text-foreground">No cards available</h3>
                        <p className="text-foreground-secondary font-medium">This set doesn't have any cards yet.</p>
                    </div>
                )}

                <div className="w-full pb-32">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground">Terms in this set ({cards.length})</h3>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsQuickAddOpen(true)}
                                className="btn-outline flex items-center gap-2 text-sm py-2 px-4 rounded-lg"
                            >
                                <span>Add or Remove Terms</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {cardsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-32 bg-surface/50 border border-border rounded-2xl animate-pulse flex items-center px-8 gap-6">
                                    <div className="w-1/3 h-4 bg-foreground/10 rounded-full" />
                                    <div className="flex-1 h-4 bg-foreground/10 rounded-full" />
                                </div>
                            ))
                        ) : cards.map((card, idx) => {
                            const cardProg = deckId ? getCardProgress(deckId, card.id) : null;
                            return (
                                <div 
                                    key={card.id} 
                                    className="bg-background-card border border-border rounded-xl p-6 shadow-sm hover:shadow-card-hover transition-all duration-200 group cursor-pointer"
                                    onClick={() => { 
                                        setCurrentIndex(idx); 
                                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                                        setIsFlipped(false); 
                                    }}
                                >
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCard(card);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStar(card.id, !card.starred);
                                                }}
                                                className="p-2 text-foreground-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Star"
                                            >
                                                <Star className={`w-[18px] h-[18px] ${card.starred ? 'fill-warning text-warning' : ''}`} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCard(card.id);
                                                }}
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
            </div>

            {/* Quick Add Modal */}
            <AnimatePresence>
                {isQuickAddOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xl font-bold">Add New Term</h3>
                                <button onClick={() => setIsQuickAddOpen(false)} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Term</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={quickAddTerm.front}
                                        onChange={e => setQuickAddTerm(prev => ({ ...prev, front: e.target.value }))}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-all font-bold"
                                        placeholder="Enter term..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Definition</label>
                                    <textarea 
                                        value={quickAddTerm.back}
                                        onChange={e => setQuickAddTerm(prev => ({ ...prev, back: e.target.value }))}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-all min-h-[100px] resize-none"
                                        placeholder="Enter definition..."
                                    />
                                </div>
                                <button 
                                    onClick={handleQuickAdd}
                                    disabled={!quickAddTerm.front.trim() || !quickAddTerm.back.trim()}
                                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                                >
                                    Add Term
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingCard && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xl font-bold">Edit Term</h3>
                                <button onClick={() => { setIsEditModalOpen(false); setEditingCard(null); }} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Term</label>
                                    <input 
                                        type="text" 
                                        value={editingCard.front}
                                        onChange={e => setEditingCard(prev => prev ? ({ ...prev, front: e.target.value }) : null)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Definition</label>
                                    <textarea 
                                        value={editingCard.back}
                                        onChange={e => setEditingCard(prev => prev ? ({ ...prev, back: e.target.value }) : null)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-all min-h-[100px] resize-none"
                                    />
                                </div>
                                <button 
                                    onClick={handleUpdateCard}
                                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    // Refresh cards after adding
                    const targetId = deckId || workspaceId;
                    if (targetId) {
                        db.getFlashcardsByDeckId(targetId).then(res => setCards(res));
                    }
                }} 
            />
        </div>
    );
}
