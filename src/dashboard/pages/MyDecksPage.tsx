import { useCallback, useEffect, useState } from 'react';
import { MoreVertical, FolderOpen, Trash2, Mic, BookMarked, Edit2, Plus, ChevronRight, X, Loader2, BookOpen, Layers, Podcast, Search, Flame, Moon, Sun, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, type WorkspaceRow, type DeckRow, type LectureNote, type StudyGuide, type PodcastRow } from '../../services/database';
import { useDecks } from '../contexts/DecksContext';
import { useTheme } from '../contexts/ThemeContext';
import { CreateModal } from '../components/CreateModal';
import { SEO } from '../components/SEO';

type TabId = 'My Decks' | 'Lectures' | 'Study Guides' | 'Podcasts' | 'Trash';
type RenameTargetType = 'myDecks' | 'lecture' | 'studyGuides';

export default function MyDecksPage() {
    const { resolvedTheme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('My Decks');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [closingMenuId, setClosingMenuId] = useState<string | null>(null);

    const { workspaces: allWorkspaces, decksLoading, refreshDecks: refreshContextDecks } = useDecks();
    const [lectures, setLectures] = useState<LectureNote[]>([]);
    const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
    const [deletedItems, setDeletedItems] = useState<{
        workspaces: WorkspaceRow[];
        decks: DeckRow[];
        lectures: LectureNote[];
        studyGuides: StudyGuide[];
        practiceTests: any[];
        podcasts: PodcastRow[];
    }>({ workspaces: [], decks: [], lectures: [], studyGuides: [], practiceTests: [], podcasts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rename Modal States
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isRenameModalClosing, setIsRenameModalClosing] = useState(false);
    const [renameText, setRenameText] = useState('');
    const [renameSaving, setRenameSaving] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{ id: string; type: RenameTargetType } | null>(null);

    // Create Modal State (from dashvis logic, though dashvis handles it elsewhere, I'll keep functionality here)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);



    const [modalInitialStep, setModalInitialStep] = useState<any>(undefined);



    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'];

    const [podcasts, setPodcasts] = useState<PodcastRow[]>([]);
    const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null);
    const tabs: TabId[] = ['My Decks', 'Lectures', 'Study Guides', 'Podcasts', 'Trash'];

    const workspaces = allWorkspaces.filter(w => !w.parentId);

    const load = useCallback(async (opts?: { isRefresh?: boolean }) => {
        if (!opts?.isRefresh) {
            setLoading(true);
        }
        setError(null);
        try {
            const [l, g, d, p] = await Promise.all([
                db.getLectureNotes(),
                db.getStudyGuides(),
                db.getDeletedItems(),
                db.getPodcasts()
            ]);

            setLectures(l);
            setStudyGuides(g);
            setDeletedItems(d);
            setPodcasts(p);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not load library');
        } finally {
            setLoading(false);
        }
    }, []);

    const location = useLocation();

    useEffect(() => {
        void load();

        // Handle tab from URL query param
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'lectures') setActiveTab('Lectures');
        else if (tabParam === 'study-guides') setActiveTab('Study Guides');

    }, [load, location.search]);

    const closeMenu = () => {
        if (!activeMenuId) return;
        setClosingMenuId(activeMenuId);
        setTimeout(() => {
            setActiveMenuId(null);
            setClosingMenuId(null);
        }, 200);
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeMenuId === id) {
            closeMenu();
        } else {
            setActiveMenuId(id);
        }
    };

    const renameModalLabel = (type: RenameTargetType): string => {
        if (type === 'myDecks') return 'My Deck';
        if (type === 'lecture') return 'Lecture';
        return 'Study Guide';
    };

    const openRename = (id: string, currentTitle: string, type: RenameTargetType) => {
        setActiveMenuId(null);
        setRenameTarget({ id, type });
        setRenameText(currentTitle);
        setIsRenameModalOpen(true);
    };

    const handleDeleteWorkspace = async (id: string) => {
        try {
            await db.deleteWorkspace(id);
            setActiveMenuId(null);
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const handleDeleteLecture = async (id: string) => {
        try {
            await db.deleteLectureNote(id);
            setActiveMenuId(null);
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const handleDeleteStudyGuide = async (id: string) => {
        try {
            await db.deleteStudyGuide(id);
            setActiveMenuId(null);
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    const handleDeletePodcast = async (id: string) => {
        try {
            await db.softDeletePodcast(id);
            setActiveMenuId(null);
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
                if (id.startsWith('ws-')) void handleDeleteWorkspace(id.replace('ws-', ''));
                else if (id.startsWith('lec-')) void handleDeleteLecture(id.replace('lec-', ''));
                else if (id.startsWith('guide-')) void handleDeleteStudyGuide(id.replace('guide-', ''));
                else if (id.startsWith('pod-')) void handleDeletePodcast(id.replace('pod-', ''));
            }, 1000);
        }
        return () => {
            if (timer !== undefined) clearTimeout(timer);
        };
    }, [isDeleteHolding]);

    const closeRenameModal = () => {
        setIsRenameModalClosing(true);
        setTimeout(() => {
            setIsRenameModalOpen(false);
            setIsRenameModalClosing(false);
            setRenameTarget(null);
            setRenameText('');
        }, 200);
    };

    const handleRenameSave = async () => {
        if (!renameTarget || !renameText.trim()) return;
        setRenameSaving(true);
        try {
            if (renameTarget.type === 'myDecks') {
                await db.updateWorkspace(renameTarget.id, { name: renameText.trim() });
            }
            // Add other rename types if needed
            closeRenameModal();
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Rename failed');
        } finally {
            setRenameSaving(false);
        }
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setModalInitialStep(undefined);
        setSelectedWorkspaceId(null);
    };



    const handleRestore = async (id: string, type: 'workspace' | 'deck' | 'lecture' | 'studyGuide' | 'practiceTest') => {
        try {
            if (type === 'workspace') await db.restoreWorkspace(id);
            else if (type === 'deck') await db.restoreDeck(id);
            else if (type === 'lecture') await db.restoreLectureNote(id);
            else if (type === 'studyGuide') await db.restoreStudyGuide(id);
            else if (type === 'practiceTest') await db.restorePracticeTest(id);
            else if (type === 'podcast') await db.restorePodcast(id);
            refreshContextDecks();
            void load({ isRefresh: true });
        } catch (e) {
            alert('Restore failed');
        }
    };

    const handlePermanentDelete = async (id: string, type: 'workspace' | 'deck' | 'lecture' | 'studyGuide' | 'practiceTest') => {
        if (!confirm('Are you sure you want to permanently delete this item?')) return;
        try {
            if (type === 'workspace') await db.permanentlyDeleteWorkspace(id);
            else if (type === 'deck') await db.permanentlyDeleteDeck(id);
            else if (type === 'lecture') await db.permanentlyDeleteLectureNote(id);
            else if (type === 'studyGuide') await db.permanentlyDeleteStudyGuide(id);
            else if (type === 'practiceTest') await db.permanentlyDeletePracticeTest(id);
            else if (type === 'podcast') await db.permanentlyDeletePodcast(id);
            void load({ isRefresh: true });
        } catch (e) {
            alert('Delete failed');
        }
    };

    const handleEmptyTrash = async () => {
        if (!confirm('Are you sure you want to permanently delete all items in the trash? This action cannot be undone.')) return;
        try {
            setLoading(true);
            await db.emptyTrash();
            void load({ isRefresh: true });
        } catch (e) {
            alert('Failed to empty trash');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-background" onClick={closeMenu}>
            <SEO title={activeTab === 'My Decks' ? 'Library' : activeTab} description="Manage your flashcards, lectures, and study materials in your Viszmo library." />
            {/* Header (Mirroring DashboardPage) */}
            <header className="h-16 flex items-center px-6 shrink-0 relative gap-2 sticky top-0 z-[20]">
                <div className="flex-1 hidden md:block"></div>

                {/* Centered Search Bar */}
                <div className="flex-1 md:flex-none w-full max-w-xl md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div className="relative flex items-center w-full h-11 rounded-2xl bg-surface border border-border px-4 focus-within:border-brand-primary focus-within:shadow-sm transition-all">
                        <Search size={18} className="text-foreground-secondary mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search for anything"
                            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-foreground-muted"
                        />
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex-1 flex justify-end items-center gap-3 shrink-0 ml-4 md:ml-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalInitialStep('type');
                            setIsCreateModalOpen(true);
                        }}
                        className="h-11 px-6 rounded-full bg-brand-primary text-white flex items-center gap-2 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 font-bold text-sm shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create</span>
                    </button>

                    <div className="h-11 px-4 rounded-full bg-surface-hover border border-border flex items-center gap-2 cursor-pointer hover:bg-surface-active hover:scale-105 active:scale-95 transition-all">
                        <Flame size={18} className="text-orange-500 fill-orange-500" />
                        <span className="text-base font-bold text-foreground">0</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="h-11 w-11 rounded-full hover:bg-surface-hover text-foreground-secondary hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                    >
                        {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Sticky Header exactly as in dashvis - adjusted for top bar */}
            <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Library</h1>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">{error}</p>
                    )}
                </div>

                <div className="border-b border-border">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex gap-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 font-medium transition-all relative ${activeTab === tab
                                            ? 'text-foreground'
                                            : 'text-foreground-secondary hover:text-foreground'
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
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 pb-40">
                {activeTab === 'My Decks' && (
                    <div>
                        <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-4">My Decks</h4>
                        {decksLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-surface/50 border border-border animate-pulse">
                                        <div className="w-4 h-4 rounded-full bg-foreground/10" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-1/3 bg-foreground/10 rounded-full" />
                                            <div className="h-3 w-1/4 bg-foreground/5 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : workspaces.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface/30 border border-border border-dashed rounded-[2rem] animate-in fade-in zoom-in duration-700">
                                <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center mb-6">
                                    <FolderOpen size={40} className="text-brand-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Your deck is empty</h3>
                                <p className="text-foreground-secondary max-w-sm mb-8 leading-relaxed font-medium">
                                    Create your first workspace to start organizing your flashcards, lectures, and study guides.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setModalInitialStep('create-deck'); setIsCreateModalOpen(true); }}
                                    className="px-8 py-3.5 bg-brand-primary text-white font-black rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2.5"
                                >
                                    <Plus size={20} />
                                    <span>Create Workspace</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {workspaces.map((ws) => (
                                    <div
                                        key={ws.id}
                                        className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/50 transition-all shadow-sm relative"
                                    >
                                        <button
                                            type="button"
                                            className="flex items-center gap-4 flex-1 text-left min-w-0"
                                            onClick={() => navigate(`/dashboard/workspaces/${ws.id}`)}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full shrink-0"
                                                style={{ backgroundColor: ws.color }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1 truncate">
                                                    {ws.name}
                                                </h3>
                                                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-sm text-foreground-secondary font-medium">
                                                    <span>{ws.stats?.cardCount || 0} cards</span>
                                                    {(ws.stats?.subdeckCount || 0) > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                {ws.stats?.subdeckCount} Sub Deck{(ws.stats?.subdeckCount || 0) !== 1 ? 's' : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span className={(ws.stats?.mastery || 0) > 0 ? 'text-emerald-400 font-bold' : ''}>
                                                        {ws.stats?.mastery || 0}% Mastery
                                                    </span>
                                                </div>
                                            </div>
                                        </button>

                                        <div className="relative shrink-0 flex items-center gap-3">

                                            <button
                                                type="button"
                                                className={`p-2 rounded-full transition-all duration-300 ${activeMenuId === `ws-${ws.id}`
                                                        ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-100'
                                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                    }`}
                                                onClick={(e) => toggleMenu(e, `ws-${ws.id}`)}
                                                aria-label="Library actions"
                                            >
                                                <MoreVertical
                                                    size={20}
                                                    className={activeMenuId === `ws-${ws.id}` ? 'popover-menu-trigger-rotate' : ''}
                                                />
                                            </button>

                                            {(activeMenuId === `ws-${ws.id}` || closingMenuId === `ws-${ws.id}`) && (
                                                <div
                                                    className={`absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl ${closingMenuId === `ws-${ws.id}` ? 'popover-menu-dropdown-closing' : 'popover-menu-dropdown-animate'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        className="popover-menu-item"
                                                        onClick={() => navigate(`/dashboard/workspaces/${ws.id}`)}
                                                    >
                                                        <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                        Open
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="popover-menu-item"
                                                        onClick={() => navigate(`/dashboard/workspaces/${ws.id}`)}
                                                    >
                                                        <Edit2 size={16} className="text-zinc-500 shrink-0" />
                                                        Edit Deck
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="popover-menu-item"
                                                        onClick={() => openRename(ws.id, ws.name, 'myDecks')}
                                                    >
                                                        <FileText size={16} className="text-zinc-500 shrink-0" />
                                                        Rename Workspace
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="popover-menu-item"
                                                        onClick={() => {
                                                            setSelectedWorkspaceId(ws.id);
                                                            setModalInitialStep('create-deck');
                                                            setSelectedWorkspaceId(ws.id);
                                                            setIsCreateModalOpen(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                    >
                                                        <Plus size={16} className="text-zinc-500 shrink-0" />
                                                        Add Subdeck
                                                    </button>
                                                    <div className="popover-menu-divider" />
                                                    <button
                                                        type="button"
                                                        className={`hold-to-delete-container ${isDeleteHolding === `ws-${ws.id}` ? 'hold-to-delete-active' : ''}`}
                                                        onMouseDown={() => setIsDeleteHolding(`ws-${ws.id}`)}
                                                        onMouseUp={() => setIsDeleteHolding(null)}
                                                        onMouseLeave={() => setIsDeleteHolding(null)}
                                                        onTouchStart={() => setIsDeleteHolding(`ws-${ws.id}`)}
                                                        onTouchEnd={() => setIsDeleteHolding(null)}
                                                    >
                                                        <div className="hold-to-delete-progress" />
                                                        <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                            <Trash2 size={16} className="shrink-0" />
                                                            <span className="font-semibold">
                                                                {isDeleteHolding === `ws-${ws.id}` ? 'Hold to confirm' : 'Delete'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Lectures' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : lectures.length === 0 ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalInitialStep('record');
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-3 p-6 border border-border border-dashed rounded-3xl text-foreground-secondary hover:text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/50 w-full transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mic size={24} className="text-rose-500" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-foreground">Live Record</span>
                                        <span className="text-xs text-foreground-secondary">Record class and generate cards</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalInitialStep('import');
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-3 p-6 border border-border border-dashed rounded-3xl text-foreground-secondary hover:text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/50 w-full transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-brand-primary" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-foreground">Upload File</span>
                                        <span className="text-xs text-foreground-secondary">PDF, PPTX, MP3, and more</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            lectures.map((n) => (
                                <div
                                    key={n.id}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm relative cursor-pointer"
                                    onClick={() => navigate(`/dashboard/transcripts/${n.id}`)}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">

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
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <button
                                                type="button"
                                                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === `lec-${n.id}` ? null : `lec-${n.id}`);
                                                }}
                                            >
                                                <MoreVertical
                                                    size={20}
                                                    className={activeMenuId === `lec-${n.id}` ? 'popover-menu-trigger-rotate' : ''}
                                                />
                                            </button>

                                            {/* Lecture Menu */}
                                            {activeMenuId === `lec-${n.id}` && (
                                                <div
                                                    className="absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl popover-menu-dropdown-animate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                                                        onClick={() => navigate(`/dashboard/transcripts/${n.id}`)}
                                                    >
                                                        <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                        Open
                                                    </button>
                                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                                                    <button
                                                        type="button"
                                                        className={`hold-to-delete-container ${isDeleteHolding === `lec-${n.id}` ? 'hold-to-delete-active' : ''}`}
                                                        onMouseDown={() => setIsDeleteHolding(`lec-${n.id}`)}
                                                        onMouseUp={() => setIsDeleteHolding(null)}
                                                        onMouseLeave={() => setIsDeleteHolding(null)}
                                                        onTouchStart={() => setIsDeleteHolding(`lec-${n.id}`)}
                                                        onTouchEnd={() => setIsDeleteHolding(null)}
                                                    >
                                                        <div className="hold-to-delete-progress" />
                                                        <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                            <Trash2 size={16} className="shrink-0" />
                                                            <span className="font-bold">
                                                                {isDeleteHolding === `lec-${n.id}` ? 'Hold to confirm' : 'Delete'}
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
                    </div>
                )}

                {activeTab === 'Study Guides' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="space-y-3">
                                {[1].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : studyGuides.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setModalInitialStep('type');
                                    setIsCreateModalOpen(true);
                                }}
                                className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all"
                            >
                                <Plus size={20} />
                                <span className="font-medium">Add more study guides</span>
                            </button>
                        ) : (
                            studyGuides.map((g) => (
                                <div
                                    key={g.id}
                                    onClick={() => navigate(`/dashboard/study-guides/${g.id}`)}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 min-w-0">

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-foreground mb-0.5 truncate">{g.title}</h3>
                                            {g.topic && <p className="text-sm text-foreground-secondary font-medium truncate">{g.topic}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <button
                                                type="button"
                                                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === `guide-${g.id}` ? null : `guide-${g.id}`);
                                                }}
                                            >
                                                <MoreVertical
                                                    size={20}
                                                    className={activeMenuId === `guide-${g.id}` ? 'popover-menu-trigger-rotate' : ''}
                                                />
                                            </button>

                                            {/* Guide Menu */}
                                            {activeMenuId === `guide-${g.id}` && (
                                                <div
                                                    className="absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl popover-menu-dropdown-animate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                                                        onClick={() => navigate(`/dashboard/study-guides/${g.id}`)}
                                                    >
                                                        <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                        Open
                                                    </button>
                                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                                                    <button
                                                        type="button"
                                                        className={`hold-to-delete-container ${isDeleteHolding === `guide-${g.id}` ? 'hold-to-delete-active' : ''}`}
                                                        onMouseDown={() => setIsDeleteHolding(`guide-${g.id}`)}
                                                        onMouseUp={() => setIsDeleteHolding(null)}
                                                        onMouseLeave={() => setIsDeleteHolding(null)}
                                                        onTouchStart={() => setIsDeleteHolding(`guide-${g.id}`)}
                                                        onTouchEnd={() => setIsDeleteHolding(null)}
                                                    >
                                                        <div className="hold-to-delete-progress" />
                                                        <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                            <Trash2 size={16} className="shrink-0" />
                                                            <span className="font-bold">
                                                                {isDeleteHolding === `guide-${g.id}` ? 'Hold to confirm' : 'Delete'}
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
                    </div>
                )}

                {activeTab === 'Podcasts' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : podcasts.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setModalInitialStep('podcast');
                                    setIsCreateModalOpen(true);
                                }}
                                className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all"
                            >
                                <Plus size={20} />
                                <span className="font-medium">Add more podcasts</span>
                            </button>
                        ) : (
                            podcasts.map((p) => (
                                <div
                                    key={p.id}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all shadow-sm relative"
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-4 flex-1 text-left min-w-0"
                                        onClick={() => navigate(`/dashboard/podcasts/${p.id}`)}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                            <Mic size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors mb-0.5 truncate">
                                                {p.title}
                                            </h3>
                                            <p className="text-sm text-foreground-secondary font-medium truncate">AI Podcast Summary</p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <button
                                                type="button"
                                                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === `pod-${p.id}` ? null : `pod-${p.id}`);
                                                }}
                                            >
                                                <MoreVertical
                                                    size={20}
                                                    className={activeMenuId === `pod-${p.id}` ? 'popover-menu-trigger-rotate' : ''}
                                                />
                                            </button>

                                            {/* Podcast Menu */}
                                            {activeMenuId === `pod-${p.id}` && (
                                                <div
                                                    className="absolute top-11 right-0 w-56 z-50 popover-menu-surface p-1.5 flex flex-col shadow-2xl popover-menu-dropdown-animate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                                                        onClick={() => navigate(`/dashboard/podcasts/${p.id}`)}
                                                    >
                                                        <FolderOpen size={16} className="text-zinc-500 shrink-0" />
                                                        Open
                                                    </button>
                                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />
                                                    <button
                                                        type="button"
                                                        className={`hold-to-delete-container ${isDeleteHolding === `pod-${p.id}` ? 'hold-to-delete-active' : ''}`}
                                                        onMouseDown={() => setIsDeleteHolding(`pod-${p.id}`)}
                                                        onMouseUp={() => setIsDeleteHolding(null)}
                                                        onMouseLeave={() => setIsDeleteHolding(null)}
                                                        onTouchStart={() => setIsDeleteHolding(`pod-${p.id}`)}
                                                        onTouchEnd={() => setIsDeleteHolding(null)}
                                                    >
                                                        <div className="hold-to-delete-progress" />
                                                        <div className="relative z-10 flex items-center gap-2.5 w-full">
                                                            <Trash2 size={16} className="shrink-0" />
                                                            <span className="font-bold">
                                                                {isDeleteHolding === `pod-${p.id}` ? 'Hold to confirm' : 'Delete'}
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
                    </div>
                )}

                {activeTab === 'Trash' && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Deleted Items</h4>
                            {(deletedItems.workspaces.length > 0 || deletedItems.decks.length > 0 || deletedItems.lectures.length > 0 || deletedItems.studyGuides.length > 0 || deletedItems.practiceTests.length > 0 || deletedItems.podcasts.length > 0) && (
                                <button
                                    onClick={handleEmptyTrash}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    Empty Trash
                                </button>
                            )}
                        </div>
                        {(deletedItems.workspaces.length === 0 && deletedItems.decks.length === 0 && deletedItems.lectures.length === 0 && deletedItems.studyGuides.length === 0 && deletedItems.practiceTests.length === 0 && deletedItems.podcasts.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface-hover/20">
                                <div className="w-16 h-16 bg-zinc-500/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Trash2 size={32} className="text-zinc-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">Trash is empty</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm font-medium">
                                    Items you delete will stay here for (3 days) before being permanently removed.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {deletedItems.workspaces.map(ws => (
                                    <div key={ws.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />
                                            <span className="font-bold text-foreground/60">{ws.name} (Set)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(ws.id, 'workspace')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(ws.id, 'workspace')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                                {deletedItems.decks.map(deck => (
                                    <div key={deck.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-zinc-500/10 rounded-lg flex items-center justify-center">
                                                <Layers size={16} className="text-zinc-500" />
                                            </div>
                                            <span className="font-bold text-foreground/60">{deck.title} (Deck)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(deck.id, 'deck')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(deck.id, 'deck')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                                {deletedItems.lectures.map(lec => (
                                    <div key={lec.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                                                <Mic size={16} className="text-red-500" />
                                            </div>
                                            <span className="font-bold text-foreground/60">{lec.title} (Lecture)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(lec.id, 'lecture')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(lec.id, 'lecture')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                                {deletedItems.studyGuides.map(guide => (
                                    <div key={guide.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                                <BookMarked size={16} className="text-amber-500" />
                                            </div>
                                            <span className="font-bold text-foreground/60">{guide.title} (Study Guide)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(guide.id, 'studyGuide')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(guide.id, 'studyGuide')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                                {deletedItems.practiceTests.map(test => (
                                    <div key={test.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                <BookOpen size={16} className="text-emerald-500" />
                                            </div>
                                            <span className="font-bold text-foreground/60">{test.title} (Practice Test)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(test.id, 'practiceTest')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(test.id, 'practiceTest')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                                {deletedItems.podcasts.map(pod => (
                                    <div key={pod.id} className="flex items-center justify-between bg-surface/50 border border-border border-dashed rounded-2xl p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                                                <Mic size={16} className="text-rose-500" />
                                            </div>
                                            <span className="font-bold text-foreground/60">{pod.title} (Podcast)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRestore(pod.id, 'podcast')} className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">Restore</button>
                                            <button onClick={() => handlePermanentDelete(pod.id, 'podcast')} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Delete Forever</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {(isRenameModalOpen || isRenameModalClosing) && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeRenameModal} />
                    <div className={`bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 ${isRenameModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">Rename {renameTarget ? renameModalLabel(renameTarget.type) : 'Item'}</h3>
                            <button onClick={closeRenameModal} className="p-2 hover:bg-surface-hover rounded-full text-foreground-secondary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">New Name</label>
                                <input
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:outline-none focus:border-brand-primary transition-colors"
                                    value={renameText}
                                    onChange={(e) => setRenameText(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={closeRenameModal} className="flex-1 py-3 bg-surface-hover text-foreground font-bold rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRenameSave}
                                    disabled={renameSaving || !renameText.trim()}
                                    className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {renameSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Unified Create Modal — uses shared CreateModal for mobile parity */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                initialWorkspaceId={selectedWorkspaceId}
                initialStep={modalInitialStep}
            />
        </div>
    );
}
