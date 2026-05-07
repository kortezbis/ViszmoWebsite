import { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
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
import { db, type WorkspaceRow, type DeckRow, type LectureNote, type StudyGuide, type FlashcardRow, type PodcastRow } from '../../services/database';
import { useDecks } from '../../dashboard/contexts/DecksContext';
import { CreateModal } from '../components/CreateModal';

const tabs = ['Cards', 'Lectures', 'Study Guides'] as const;
type TabId = (typeof tabs)[number];

export default function WorkspaceDetailPage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { workspaces, decks, decksLoading, getDecksInWorkspace, refreshDecks: refreshContextDecks } = useDecks();

    const workspace = workspaces.find(w => w.id === workspaceId);
    const [activeTab, setActiveTab] = useState<'Cards' | 'Lectures' | 'Study Guides'>('Cards');
    const workspaceDecks = useMemo(() => {
        if (!workspaceId) return [];
        return decks.filter(d => d.workspaceId === workspaceId && !d.isDeleted);
    }, [decks, workspaceId]);

    const [workspaceCards, setWorkspaceCards] = useState<FlashcardRow[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [workspaceLectures, setWorkspaceLectures] = useState<LectureNote[]>([]);
    const [workspaceGuides, setWorkspaceGuides] = useState<StudyGuide[]>([]);
    const [workspacePodcasts, setWorkspacePodcasts] = useState<PodcastRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
    const [isStudyModalClosing, setIsStudyModalClosing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [closingMenuId, setClosingMenuId] = useState<string | null>(null);
    const [modalInitialStep, setModalInitialStep] = useState<any>(undefined);

    // Modal States
    const [modalType, setModalType] = useState<'rename' | 'subdeck' | 'deck' | null>(null);
    const [modalClosing, setModalClosing] = useState(false);
    const [modalName, setModalName] = useState('');
    const [modalSaving, setModalSaving] = useState(false);
    const [subdeckColor, setSubdeckColor] = useState('#3B82F6');

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'];

    const subWorkspaces = useMemo(() => {
        if (!workspaces || !decks) return [];
        return workspaces
            .filter(w => w.parentId === workspaceId)
            .map(sw => {
                const decksInSub = decks.filter(d => d.workspaceId === sw.id);
                const cardCount = decksInSub.reduce((acc, d) => acc + (d.cardCount ?? (d.cards?.length || 0)), 0);
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
            const [l, g, p] = await Promise.all([
                db.getNotesByWorkspace(workspaceId),
                db.getStudyGuidesByWorkspace(workspaceId),
                db.getPodcastsByWorkspace(workspaceId)
            ]);

            setWorkspaceLectures(l);
            setWorkspaceGuides(g);
            setWorkspacePodcasts(p);
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

    // Lazy load cards when tab is selected
    useEffect(() => {
        if (activeTab === 'Cards' && workspaceId && workspaceCards.length === 0) {
            const loadCards = async () => {
                setLoadingCards(true);
                try {
                    const c = await db.getFlashcardsByWorkspace(workspaceId);
                    setWorkspaceCards(c);
                } catch (e) {
                    console.error('[WorkspaceDetail] Cards load failed:', e);
                } finally {
                    setLoadingCards(false);
                }
            };
            void loadCards();
        }
    }, [activeTab, workspaceId, workspaceCards.length]);

    // Calculate total cards for "Study All"
    const totalCardsCount = useMemo(() => {
        const direct = workspaceDecks.reduce((acc, d) => acc + (d.cardCount ?? 0), 0);
        const subs = subWorkspaces.reduce((acc, sw) => acc + (sw.stats?.cardCount || 0), 0);
        return direct + subs;
    }, [workspaceDecks, subWorkspaces]);

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
                // Use parent workspace color for sub-decks as requested
                await db.createWorkspace(modalName.trim(), workspace.color || '#3B82F6', undefined, workspaceId);
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

    if (decksLoading && !workspace) {
        return (
            <div className="w-full h-full bg-background flex flex-col overflow-hidden">
                <header className="h-16 border-b border-border bg-surface flex items-center px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-foreground/5 animate-pulse" />
                        <div className="w-32 h-6 bg-foreground/10 rounded-full animate-pulse" />
                    </div>
                </header>
                <div className="flex-1 p-8 overflow-hidden">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Header skeleton */}
                        <div className="space-y-4">
                            <div className="h-12 w-2/3 bg-foreground/10 rounded-3xl animate-pulse" />
                            <div className="h-4 w-1/3 bg-foreground/5 rounded-full animate-pulse" />
                        </div>
                        
                        {/* Tabs skeleton */}
                        <div className="flex gap-8 border-b border-border pb-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-4 w-20 bg-foreground/5 rounded-full animate-pulse" />
                            ))}
                        </div>

                        {/* Content grid skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-surface/50 border border-border rounded-[2rem] animate-pulse p-6 flex flex-col justify-between">
                                    <div className="w-10 h-10 rounded-2xl bg-foreground/5" />
                                    <div className="space-y-3">
                                        <div className="h-5 w-3/4 bg-foreground/10 rounded-full" />
                                        <div className="h-3 w-1/2 bg-foreground/5 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-20 px-6">
                <p className="text-foreground-secondary font-medium">{error || 'Deck not found'}</p>
                <button onClick={() => navigate('/dashboard/decks')} className="text-brand-primary font-bold hover:underline">
                    Back to Library
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
                                    className={`p-2 rounded-full transition-all duration-300 ${isMenuOpen
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
                                        {!workspace?.parentId && (
                                            <button
                                                type="button"
                                                className="popover-menu-item"
                                                onClick={() => openModal('subdeck')}
                                            >
                                                <Plus size={16} className="text-zinc-500 shrink-0" />
                                                Add Sub Deck
                                            </button>
                                        )}
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
                                                    await navigator.clipboard.writeText(`Check out my deck: ${workspace.name}`);
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
                                                    {isDeleteHolding === 'root' ? 'Hold to confirm' : 'Delete'}
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
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={totalCardsCount === 0}
                                        className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-40 active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsStudyModalOpen(true);
                                        }}
                                    >
                                        <Play size={16} className="fill-white shrink-0" />
                                        <span>Study Deck</span>
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
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'
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
                        {/* Sub Decks Section */}
                        {(!workspace?.parentId || subWorkspaces.length > 0) && (
                            loading ? (
                                <div>
                                    <div className="flex items-center gap-4 mb-4 px-2">
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">Sub Decks ({subWorkspaces.length})</h2>
                                        <div className="h-px bg-border/50 flex-1" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-16 rounded-2xl bg-surface-hover/50 animate-pulse" />
                                        <div className="h-16 rounded-2xl bg-surface-hover/50 animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-4 mb-4 px-2">
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">Sub Decks ({subWorkspaces.length})</h2>
                                        <div className="h-px bg-border/50 flex-1" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {subWorkspaces.map((sw) => (
                                            <div
                                                key={sw.id}
                                                className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/50 transition-all shadow-sm cursor-pointer relative"
                                                onClick={() => navigate(`/dashboard/workspaces/${sw.id}`)}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div
                                                        className="w-3 h-3 rounded-full shrink-0"
                                                        style={{ backgroundColor: sw.color }}
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors truncate">
                                                            {sw.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <button
                                                            type="button"
                                                            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                                            onClick={(e) => toggleSubMenu(e, `sw-${sw.id}`)}
                                                        >
                                                            <MoreVertical
                                                                size={20}
                                                                className={activeMenuId === `sw-${sw.id}` ? 'popover-menu-trigger-rotate' : ''}
                                                            />
                                                        </button>

                                                        {/* Sub-workspace Menu */}
                                                        {(activeMenuId === `sw-${sw.id}` || closingMenuId === `sw-${sw.id}`) && (
                                                            <div
                                                                className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `sw-${sw.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
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
                                            </div>
                                        ))}
                                        {!workspace?.parentId && (
                                            <button
                                                type="button"
                                                onClick={() => openModal('subdeck')}
                                                className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all"
                                            >
                                                <Plus size={20} />
                                                <span className="font-medium">Create Sub Deck</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                        {/* Cards Section */}
                        <div>
                            <div className="flex items-center gap-4 mb-4 px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">Cards ({totalCardsCount})</h2>
                                <div className="h-px bg-border/50 flex-1" />
                            </div>
                            <div className="flex flex-col gap-3">
                                {loading || loadingCards ? (
                                    <div className="space-y-3">
                                        <div className="h-20 rounded-2xl bg-surface-hover/50 animate-pulse" />
                                        <div className="h-20 rounded-2xl bg-surface-hover/50 animate-pulse" />
                                    </div>
                                ) : totalCardsCount === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-surface/30 border border-border border-dashed rounded-[2rem] animate-in fade-in zoom-in duration-700">
                                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
                                            <Layers size={32} className="text-brand-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">No flashcards yet</h3>
                                        <p className="text-foreground-secondary text-sm max-w-[240px] mb-6 leading-relaxed">
                                            Start by creating your first flashcard deck in this workspace.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-xl transition-all flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                            <span>Create Deck</span>
                                        </button>
                                    </div>
                                ) : (
                                    workspaceCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="group bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm relative"
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
                                                        className={`p-1.5 rounded-full transition-all duration-300 ${activeMenuId === `card-${card.id}`
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
                                                                    navigate(`/dashboard/edit-deck/${card.deckId}`);
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
                                {totalCardsCount > 0 && (
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
                        <div className="flex items-center gap-4 mb-4 px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">Lectures ({workspaceLectures.length})</h2>
                            <div className="h-px bg-border/50 flex-1" />
                        </div>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : workspaceLectures.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-border rounded-3xl bg-surface-hover/20 w-full text-center">
                                <h3 className="text-xl font-bold text-foreground mb-2">No lectures here yet</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm mb-8">
                                    Record or upload your lectures to generate transcripts and study sets automatically.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-8 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Lecture
                                </button>
                            </div>
                        ) : (
                            workspaceLectures.map((n) => (
                                <div
                                    key={n.id}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm relative"
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-4 flex-1 text-left min-w-0"
                                        onClick={() => navigate(`/dashboard/transcripts/${n.id}`)}
                                    >

                                        <div className="flex flex-col min-w-0">
                                            <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors mb-0.5 truncate">
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
                        <div className="flex items-center gap-4 mb-4 px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">Study Guides ({workspaceGuides.length})</h2>
                            <div className="h-px bg-border/50 flex-1" />
                        </div>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : workspaceGuides.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-border rounded-3xl bg-surface-hover/20 w-full text-center">
                                <h3 className="text-xl font-bold text-foreground mb-2">No study guides yet</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm mb-8">
                                    Synthesize your cards and lectures into a comprehensive study guide.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-8 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    Create Guide
                                </button>
                            </div>
                        ) : (
                            workspaceGuides.map((g) => (
                                <div
                                    key={g.id}
                                    onClick={() => navigate(`/dashboard/study-guides/${g.id}`)}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-foreground truncate">{g.title}</h3>
                                            {g.topic && <p className="text-sm text-foreground-secondary truncate">{g.topic}</p>}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-brand-primary transition-colors shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                )}


            </div>

            {/* Modals */}
            {(modalType !== null || modalClosing) && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
                    <div className={`bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 ${modalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
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
                                <div className="h-2" />
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
                        className={`w-full max-w-md bg-surface rounded-2xl shadow-xl p-5 max-h-[min(80vh,520px)] flex flex-col ${isStudyModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="text-lg font-bold text-foreground">What do you want to study?</h3>
                            <button
                                type="button"
                                onClick={closeStudyModal}
                                className="p-2 hover:bg-surface-hover rounded-full text-foreground-secondary transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-foreground-secondary mb-4"></p>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 flex flex-col gap-2">
                            {/* Study Entire Workspace */}
                            <button
                                type="button"
                                disabled={totalCardsCount === 0}
                                onClick={() => {
                                    closeStudyModal();
                                    navigate(`/dashboard/hub?workspaceId=${workspaceId}`);
                                }}
                                className="group flex flex-col justify-center gap-1 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex-1 min-w-0 relative z-10">
                                    <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">Study all decks</h3>
                                    <p className="text-sm text-foreground-secondary truncate">{totalCardsCount} cards • includes all sub-decks</p>
                                </div>
                            </button>

                            {/* Main Deck Option */}
                            <div className="mt-2 flex flex-col gap-2">
                                <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1 ml-1">Main Deck</h4>
                                <button
                                    type="button"
                                    disabled={workspaceDecks.reduce((acc, d) => acc + (d.cardCount ?? 0), 0) === 0}
                                    onClick={() => {
                                        closeStudyModal();
                                        navigate(`/dashboard/hub?workspaceId=${workspaceId}&subDecks=false`);
                                    }}
                                    className="group flex flex-col justify-center gap-1 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">{workspace?.name}</h3>
                                        <p className="text-sm text-foreground-secondary truncate">
                                            {workspaceDecks.reduce((acc, d) => acc + (d.cardCount ?? 0), 0)} cards • Main Deck
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* List Sub Decks */}
                            {subWorkspaces.length > 0 && (
                                <div className="mt-2 flex flex-col gap-2">
                                    <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1 ml-1">Sub Decks ({subWorkspaces.length})</h4>
                                    {subWorkspaces.map((sw) => (
                                        <button
                                            key={sw.id}
                                            type="button"
                                            disabled={(sw.stats?.cardCount || 0) === 0}
                                            onClick={() => {
                                                closeStudyModal();
                                                navigate(`/dashboard/hub?workspaceId=${sw.id}`);
                                            }}
                                            className="group flex flex-col justify-center gap-1 bg-surface border border-border rounded-2xl p-4 text-left hover:border-brand-primary/50 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sw.color }} />
                                                    <h3 className="font-bold text-foreground truncate group-hover:text-brand-primary transition-colors">{sw.name}</h3>
                                                </div>
                                                <p className="text-sm text-foreground-secondary truncate">
                                                    {sw.stats.cardCount} cards • Subdeck
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Unified Create Modal */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setModalInitialStep(undefined); }}
                initialWorkspaceId={workspaceId}
                initialStep={modalInitialStep}
            />
        </div>
    );
}
