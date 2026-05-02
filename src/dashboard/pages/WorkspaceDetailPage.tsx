import { useCallback, useEffect, useState, useMemo } from 'react';
import { 
    ChevronLeft, 
    MoreVertical, 
    Plus, 
    Play, 
    Edit2, 
    Trash2, 
    Loader2, 
    X, 
    Layers, 
    Mic, 
    Podcast, 
    Share2, 
    FolderOpen,
    Check,
    BookMarked,
    Sparkles,
    BrainCircuit,
    Zap,
    Puzzle,
    PenTool,
    ClipboardCheck,
    ChevronDown
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type WorkspaceRow, type DeckRow, type LectureNote, type StudyGuide, type FlashcardRow } from '../../services/database';
import { useDecks } from '../../dashboard/contexts/DecksContext';

const tabs = ['Cards', 'Lectures', 'Study Guides', 'Podcasts'] as const;
type TabId = (typeof tabs)[number];

export default function WorkspaceDetailPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { workspaces, decks, decksLoading, getDecksInWorkspace, refreshDecks: refreshContextDecks } = useDecks();

    const workspace = workspaces.find(w => w.id === workspaceId);
    const [activeTab, setActiveTab] = useState<'Cards' | 'Lectures' | 'Study Guides' | 'Podcasts'>('Cards');
    const [workspaceDecks, setWorkspaceDecks] = useState<DeckRow[]>([]);
    const [workspaceCards, setWorkspaceCards] = useState<FlashcardRow[]>([]);
    const [workspaceLectures, setWorkspaceLectures] = useState<LectureNote[]>([]);
    const [workspaceGuides, setWorkspaceGuides] = useState<StudyGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
    const [isStudyModalClosing, setIsStudyModalClosing] = useState(false);
    const [generateMenuOpen, setGenerateMenuOpen] = useState(false);
    const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [closingMenuId, setClosingMenuId] = useState<string | null>(null);

    // Modal States
    const [modalType, setModalType] = useState<'rename' | 'subdeck' | 'deck' | null>(null);
    const [modalClosing, setModalClosing] = useState(false);
    const [modalName, setModalName] = useState('');
    const [modalSaving, setModalSaving] = useState(false);
    const [subdeckColor, setSubdeckColor] = useState('#3B82F6');

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9', '#F43F5E'];

    const subWorkspaces = useMemo(() => {
        return workspaces
            .filter(w => w.parentId === workspaceId)
            .map(sw => {
                const decksInSub = decks.filter(d => d.workspaceId === sw.id);
                const cardCount = decksInSub.reduce((acc, d) => acc + (d.cardCount ?? d.cards.length), 0);
                const subSubWorkspaces = workspaces.filter(w => w.parentId === sw.id);
                return {
                    ...sw,
                    stats: {
                        cardCount,
                        subdeckCount: subSubWorkspaces.length
                    }
                };
            });
    }, [workspaces, decks, workspaceId]);

    const load = useCallback(async (opts?: { isRefresh?: boolean }) => {
        if (!workspaceId) return;
        if (!opts?.isRefresh) setLoading(true);
        setError(null);
        try {
            // Context handles workspaces and decks. 
            // We only fetch the "extras" here (Lectures, Guides, etc.)
            const [l, g, c] = await Promise.all([
                db.getNotesByWorkspace(workspaceId),
                db.getStudyGuidesByWorkspace(workspaceId),
                db.getFlashcardsByWorkspace(workspaceId) // Optional: for Study All count
            ]);

            setWorkspaceLectures(l);
            setWorkspaceGuides(g);
            setWorkspaceCards(c);
        } catch (e: any) {
            console.error('[WorkspaceDetail] Load failed:', e);
            setError('Failed to load library data');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        void load();
    }, [load]);

    const closeMainMenu = () => {
        if (!isMenuOpen) return;
        setIsMenuClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }, 200);
    };

    const closeStudyModal = () => {
        if (!isStudyModalOpen) return;
        setIsStudyModalClosing(true);
        setTimeout(() => {
            setIsStudyModalOpen(false);
            setIsStudyModalClosing(false);
        }, 200);
    };

    const closeSubMenu = () => {
        if (!activeMenuId) return;
        setClosingMenuId(activeMenuId);
        setTimeout(() => {
            setActiveMenuId(null);
            setClosingMenuId(null);
        }, 200);
    };

    const toggleSubMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeMenuId === id) closeSubMenu();
        else setActiveMenuId(id);
    };

    const openModal = (type: 'rename' | 'subdeck' | 'deck', initialName = '') => {
        setModalType(type);
        setModalName(initialName);
        setModalClosing(false);
    };

    const closeModal = () => {
        setModalClosing(true);
        setTimeout(() => {
            setModalType(null);
            setModalClosing(false);
            setModalName('');
        }, 200);
    };

    const handleModalSave = async () => {
        if (!workspaceId || !modalName.trim()) return;
        setModalSaving(true);
        try {
            if (modalType === 'rename') {
                await db.updateWorkspace(workspaceId, { name: modalName.trim() });
            } else if (modalType === 'subdeck') {
                await db.createWorkspace(modalName.trim(), subdeckColor, undefined, workspaceId);
            } else if (modalType === 'deck') {
                await db.createDeck(modalName.trim(), workspaceId);
            }
            closeModal();
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Action failed');
        } finally {
            setModalSaving(false);
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!workspaceId) return;
        try {
            await db.deleteWorkspace(workspaceId);
            navigate('/dashboard/decks');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const handleDeleteSubItem = async (type: 'sw' | 'deck', id: string) => {
        try {
            if (type === 'sw') await db.deleteWorkspace(id);
            else await db.deleteDeck(id);
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (isDeleteHolding) {
            timer = setTimeout(() => {
                const id = isDeleteHolding;
                setIsDeleteHolding(null);
                if (id === 'root') void handleDeleteWorkspace();
                else if (id.startsWith('sw-')) void handleDeleteSubItem('sw', id.replace('sw-', ''));
                else if (id.startsWith('deck-')) void handleDeleteSubItem('deck', id.replace('deck-', ''));
            }, 1000);
        }
        return () => {
            if (timer !== undefined) clearTimeout(timer);
        };
    }, [isDeleteHolding]);

    if ((loading || decksLoading) && !workspace) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground-secondary min-h-[50vh]">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
                <p className="text-sm font-medium">Loading library…</p>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-20 px-6">
                <p className="text-foreground-secondary font-medium">{error || 'Library not found'}</p>
                <button onClick={() => navigate('/dashboard/decks')} className="text-brand-primary font-bold hover:underline">
                    Back to library
                </button>
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full overflow-y-auto bg-background"
            onClick={() => {
                closeMainMenu();
                closeSubMenu();
                setGenerateMenuOpen(false);
            }}
        >
            {/* Sticky Header - Mirroring dashvis exactly */}
            <div className="sticky top-14 md:top-0 z-20 bg-surface">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(-1);
                                }}
                                className="p-2 hover:bg-surface-hover rounded-full text-foreground transition-all shrink-0 active:scale-90"
                                aria-label="Back"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div
                                className="w-8 h-8 rounded-full shadow-sm shrink-0"
                                style={{ backgroundColor: workspace.color || '#3B82F6' }}
                            />
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">{workspace?.name || 'Library'}</h1>
                                <p className="text-xs text-foreground-secondary font-medium">
                                    {workspaceCards.length} Cards · {subWorkspaces.length} Sub Decks
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMenuOpen) closeMainMenu();
                                        else setIsMenuOpen(true);
                                    }}
                                    className={`p-2 rounded-full transition-all duration-300 ${
                                        isMenuOpen
                                            ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <MoreVertical 
                                        size={20} 
                                        className={isMenuOpen ? 'popover-menu-trigger-rotate' : ''} 
                                    />
                                </button>
                                {(isMenuOpen || isMenuClosing) && (
                                    <div className={`absolute right-0 mt-3 w-56 z-50 text-left popover-menu-surface p-1.5 shadow-2xl ${isMenuClosing ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                                        <button
                                            type="button"
                                            className="popover-menu-item"
                                            onClick={() => openModal('subdeck')}
                                        >
                                            <Plus size={16} className="text-zinc-500 shrink-0" />
                                            Add Sub Deck
                                        </button>
                                        <button
                                            type="button"
                                            className="popover-menu-item"
                                            onClick={() => openModal('rename', workspace.name)}
                                        >
                                            <Edit2 size={16} className="text-zinc-500 shrink-0" />
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            className="popover-menu-item"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(`Check out my library: ${workspace.name}`);
                                                } catch { /* ignore */ }
                                            }}
                                        >
                                            <Share2 size={16} className="text-zinc-500 shrink-0" />
                                            Share Link
                                        </button>
                                        <div className="popover-menu-divider" />
                                        <button
                                            type="button"
                                            className={`hold-to-delete-container ${isDeleteHolding === 'root' ? 'hold-to-delete-active' : ''}`}
                                            onMouseDown={() => setIsDeleteHolding('root')}
                                            onMouseUp={() => setIsDeleteHolding(null)}
                                            onMouseLeave={() => setIsDeleteHolding(null)}
                                            onTouchStart={() => setIsDeleteHolding('root')}
                                            onTouchEnd={() => setIsDeleteHolding(null)}
                                        >
                                            <div className="hold-to-delete-progress" />
                                            <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                <Trash2 size={16} className="shrink-0" />
                                                <span className="font-semibold">
                                                    {isDeleteHolding === 'root' ? 'Hold to confirm' : 'Delete library'}
                                                </span>
                                            </div>
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
                                        <div className="absolute right-0 mt-2 w-64 z-50 popover-menu-surface p-1.5 shadow-2xl popover-menu-dropdown-animate">
                                            <p className="px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-foreground-secondary">
                                                Add to this library
                                            </p>
                                            <button 
                                                className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                                                onClick={() => openModal('deck')}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                                    <Layers size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-foreground text-sm">Flashcards</span>
                                                    <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                                                        Create a study deck here
                                                    </span>
                                                </div>
                                            </button>
                                            <button 
                                                className="w-full flex items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-hover transition-colors"
                                                onClick={() => openModal('subdeck')}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                    <Plus size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-foreground text-sm">Sub Deck</span>
                                                    <span className="block text-xs text-foreground-secondary mt-0.5 leading-snug">
                                                        Organize with a sub deck
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={workspaceDecks.length === 0}
                                    className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 active:scale-95"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsStudyModalOpen(true);
                                    }}
                                >
                                    <Play size={16} className="fill-white shrink-0" />
                                    <span>Study All</span>
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Unified Tab Navigation */}
                <div className="border-b border-border w-full">
                    <div className="max-w-4xl mx-auto px-6 flex gap-8">
                        {tabs.map((tab) => (
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

            <div className="max-w-4xl mx-auto py-8 px-6 pb-40 min-h-[70vh]">
                {activeTab === 'Cards' && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        {/* Sub Decks Section - Only show for Main Decks */}
                        {!workspace?.parentId && (
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted mb-4 px-2">Sub Decks</h2>
                                <div className="flex flex-col gap-3">
                                    {subWorkspaces.map((sw) => (
                                        <div
                                            key={sw.id}
                                            className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/50 transition-all shadow-sm relative"
                                        >
                                            <button
                                                type="button"
                                                className="flex items-center gap-4 flex-1 text-left min-w-0"
                                                onClick={() => navigate(`/dashboard/workspaces/${sw.id}`)}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full shrink-0"
                                                    style={{ backgroundColor: sw.color || '#3B82F6' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">
                                                        {sw.name}
                                                    </h3>
                                                    <p className="text-sm text-foreground-secondary">
                                                        {sw.stats?.cardCount || 0} cards
                                                        {(sw.stats?.subdeckCount || 0) > 0 && ` · ${sw.stats.subdeckCount} Sub Decks`}
                                                    </p>
                                                </div>
                                            </button>
                                            
                                            <div className="relative shrink-0">
                                                <button
                                                    type="button"
                                                    className={`p-2 rounded-full transition-all duration-300 ${
                                                        activeMenuId === `sw-${sw.id}`
                                                            ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                    }`}
                                                    onClick={(e) => toggleSubMenu(e, `sw-${sw.id}`)}
                                                >
                                                    <MoreVertical 
                                                        size={20} 
                                                        className={activeMenuId === `sw-${sw.id}` ? 'popover-menu-trigger-rotate' : ''} 
                                                    />
                                                </button>

                                                {/* Sub-workspace Menu */}
                                                {(activeMenuId === `sw-${sw.id}` || closingMenuId === `sw-${sw.id}`) && (
                                                    <div className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `sw-${sw.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}>
                                                        <button
                                                            type="button"
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                                                            onClick={() => navigate(`/dashboard/workspaces/${sw.id}`)}
                                                        >
                                                            <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                            Open
                                                        </button>
                                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                                                        <button
                                                            type="button"
                                                            className={`hold-to-delete-container ${isDeleteHolding === `sw-${sw.id}` ? 'hold-to-delete-active' : ''}`}
                                                            onMouseDown={() => setIsDeleteHolding(`sw-${sw.id}`)}
                                                            onMouseUp={() => setIsDeleteHolding(null)}
                                                            onMouseLeave={() => setIsDeleteHolding(null)}
                                                        >
                                                            <div className="hold-to-delete-progress" />
                                                            <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                                <Trash2 size={16} className="shrink-0" />
                                                                <span className="font-bold">
                                                                    {isDeleteHolding === `sw-${sw.id}` ? 'Hold to confirm' : 'Delete'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => openModal('subdeck')}
                                        className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all"
                                    >
                                        <Plus size={20} />
                                        <span className="font-medium">Create Sub Deck</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Cards Section */}
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted mb-4 px-2">Cards ({workspaceCards.length})</h2>
                            <div className="flex flex-col gap-3">
                            {workspaceCards.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGenerateMenuOpen(true);
                                    }}
                                    className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-border rounded-3xl bg-surface-hover/20 hover:bg-surface-hover/40 transition-all group w-full"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">No cards yet</h3>
                                    <p className="text-foreground-secondary text-sm text-center max-w-xs">
                                        Click add to create your first flashcards in this workspace.
                                    </p>
                                </button>
                            ) : (
                                workspaceCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="group bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm relative"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground mb-2 line-clamp-2">
                                                    {card.front}
                                                </p>
                                                <div className="h-px bg-border w-full my-3" />
                                                <p className="text-sm text-foreground-secondary line-clamp-3 whitespace-pre-wrap">
                                                    {card.back}
                                                </p>
                                            </div>
                                            <div className="relative shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === `card-${card.id}` ? null : `card-${card.id}`);
                                                    }}
                                                    className={`p-1.5 rounded-full transition-all duration-300 ${
                                                        activeMenuId === `card-${card.id}`
                                                            ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                    }`}
                                                >
                                                    <MoreVertical size={18} className={activeMenuId === `card-${card.id}` ? 'popover-menu-trigger-rotate' : ''} />
                                                </button>

                                                {(activeMenuId === `card-${card.id}` || closingMenuId === `card-${card.id}`) && (
                                                    <div
                                                        className={`absolute top-11 right-0 w-40 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `card-${card.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="popover-menu-item"
                                                            onClick={() => {
                                                                navigate(`/dashboard/flashcards?deckId=${card.deckId}`);
                                                                setActiveMenuId(null);
                                                            }}
                                                        >
                                                            <Edit2 size={14} className="text-zinc-500 shrink-0" />
                                                            Edit
                                                        </button>
                                                        <div className="popover-menu-divider" />
                                                        <button
                                                            type="button"
                                                            className={`hold-to-delete-container py-2 ${isDeleteHolding === `card-${card.id}` ? 'hold-to-delete-active' : ''}`}
                                                            onMouseDown={() => setIsDeleteHolding(`card-${card.id}`)}
                                                            onMouseUp={() => setIsDeleteHolding(null)}
                                                            onMouseLeave={() => setIsDeleteHolding(null)}
                                                            onTouchStart={() => setIsDeleteHolding(`card-${card.id}`)}
                                                            onTouchEnd={() => setIsDeleteHolding(null)}
                                                        >
                                                            <div className="hold-to-delete-progress" />
                                                            <div className="relative z-10 flex items-center gap-2 w-full">
                                                                <Trash2 size={14} className="shrink-0" />
                                                                <span className="font-semibold text-xs">
                                                                    {isDeleteHolding === `card-${card.id}` ? 'Confirm' : 'Delete'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {workspaceCards.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => openModal('deck')}
                                    className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all mt-2"
                                >
                                    <Plus size={20} />
                                    <span className="font-medium">Add Flashcard</span>
                                </button>
                            )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Lectures' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        {workspaceLectures.length === 0 ? (
                            <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-12 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
                                    <Mic size={32} />
                                </div>
                                <p className="text-lg font-bold text-foreground">No lectures in this workspace</p>
                                <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                                    Record your first lecture to see it here and generate study materials.
                                </p>
                            </div>
                        ) : (
                            workspaceLectures.map((n) => (
                                <div
                                    key={n.id}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm relative"
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-4 flex-1 text-left min-w-0"
                                        onClick={() => navigate(`/dashboard/transcripts/${n.id}`)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                            <Mic size={20} className="text-red-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                                                {n.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-foreground-secondary font-medium">
                                                <span>{n.date}</span>
                                                <span>•</span>
                                                <span>{n.duration}</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'Study Guides' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        {workspaceGuides.length === 0 ? (
                            <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-12 text-center">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                                    <BookMarked size={32} />
                                </div>
                                <p className="text-lg font-bold text-foreground">No study guides yet</p>
                                <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                                    Generate a study guide from your decks or lectures.
                                </p>
                            </div>
                        ) : (
                            workspaceGuides.map((g) => (
                                <div
                                    key={g.id}
                                    className="flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <BookMarked size={20} className="text-amber-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-foreground truncate">{g.title}</h3>
                                            {g.topic && <p className="text-sm text-foreground-secondary truncate">{g.topic}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'Podcasts' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        <div className="border border-dashed border-border rounded-3xl bg-surface-hover/20 px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mx-auto mb-4">
                                <Podcast size={32} />
                            </div>
                            <p className="text-lg font-bold text-foreground">Turn this workspace into a Podcast</p>
                            <p className="text-sm text-foreground-secondary mt-2 max-w-md mx-auto">
                                Viszmo will generate an engaging host-style dialogue summarizing your cards and notes.
                            </p>
                            <button
                                type="button"
                                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
                            >
                                <Sparkles size={18} />
                                Generate Podcast
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {(modalType !== null || modalClosing) && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
                    <div className={`bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 ${modalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                {modalType === 'rename' ? 'Rename Item' : modalType === 'subdeck' ? 'New Sub Deck' : 'New Study Deck'}
                            </h3>
                            <button onClick={closeModal} className="p-2 hover:bg-surface-hover rounded-full text-foreground-secondary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Title</label>
                                <input
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:outline-none focus:border-brand-primary transition-colors"
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    placeholder="Enter title..."
                                    autoFocus
                                />
                            </div>

                            {modalType === 'subdeck' && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Color</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {COLORS.map(color => (
                                            <button 
                                                key={color} 
                                                onClick={() => setSubdeckColor(color)}
                                                className={`h-10 rounded-xl transition-all relative ${subdeckColor === color ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-surface scale-105' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {subdeckColor === color && <Check size={16} className="text-white mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-surface-hover text-foreground font-bold rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleModalSave}
                                    disabled={modalSaving || !modalName.trim()}
                                    className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {modalSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Study Modal */}
            {(isStudyModalOpen || isStudyModalClosing) && (
                <div
                    className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/60"
                    onClick={closeStudyModal}
                >
                    <div
                        className={`w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-5 max-h-[min(80vh,520px)] flex flex-col ${isStudyModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="text-lg font-bold text-foreground">What do you want to study?</h3>
                            <button
                                type="button"
                                onClick={closeStudyModal}
                                className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-secondary hover:text-foreground transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-foreground-secondary mb-4">Select a deck or the entire library.</p>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 flex flex-col gap-2">
                            {/* Study Entire Workspace */}
                            <button
                                type="button"
                                onClick={() => {
                                    closeStudyModal();
                                    navigate(`/dashboard/flashcards?workspaceId=${workspaceId}`);
                                }}
                                className="group flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/20">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0 relative z-10">
                                    <h3 className="font-bold text-foreground truncate">Entire Library</h3>
                                    <p className="text-sm text-foreground-secondary truncate">{workspaceCards.length} cards across all decks</p>
                                </div>
                            </button>

                            {/* List Decks */}
                            {workspaceDecks.length > 0 ? (
                                <div className="mt-2 flex flex-col gap-2">
                                    <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1 ml-1">Decks</h4>
                                    {workspaceDecks.map((deck) => (
                                        <button
                                            key={deck.id}
                                            type="button"
                                            onClick={() => {
                                                closeStudyModal();
                                                navigate(`/dashboard/flashcards?deckId=${deck.id}`);
                                            }}
                                            className="group flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                                style={{ backgroundColor: deck.color ? `${deck.color}15` : '#3B82F615' }}
                                            >
                                                <Layers size={20} style={{ color: deck.color || '#3B82F6' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">{deck.title}</h3>
                                                <p className="text-sm text-foreground-secondary truncate">
                                                    {deck.cardCount ?? deck.cards.length} cards
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-foreground-secondary">No decks available in this library.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
