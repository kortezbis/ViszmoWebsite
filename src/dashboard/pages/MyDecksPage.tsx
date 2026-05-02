import { useCallback, useEffect, useState } from 'react';
import { MoreVertical, FolderOpen, Trash2, Mic, BookMarked, Edit2, Plus, ChevronRight, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, type WorkspaceRow, type DeckRow, type LectureNote, type StudyGuide } from '../../services/database';
import { useDecks } from '../contexts/DecksContext';

type TabId = 'Library' | 'Lectures' | 'Study Guides';
type RenameTargetType = 'myDecks' | 'lecture' | 'studyGuides';

export default function MyDecksPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('Library');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [closingMenuId, setClosingMenuId] = useState<string | null>(null);
    
    const { workspaces: allWorkspaces, decksLoading, refreshDecks: refreshContextDecks } = useDecks();
    const [lectures, setLectures] = useState<LectureNote[]>([]);
    const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
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
    const [isCreateModalClosing, setIsCreateModalClosing] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createSaving, setCreateSaving] = useState(false);

    const [isDeleteHolding, setIsDeleteHolding] = useState<string | null>(null);
    const tabs: TabId[] = ['Library', 'Lectures', 'Study Guides'];

    const workspaces = allWorkspaces.filter(w => !w.parentId);

    const load = useCallback(async (opts?: { isRefresh?: boolean }) => {
        if (!opts?.isRefresh) {
            setLoading(true);
        }
        setError(null);
        try {
            const [l, g] = await Promise.all([
                db.getLectureNotes(),
                db.getStudyGuides()
            ]);
            
            setLectures(l);
            setStudyGuides(g);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not load library');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

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
        if (type === 'myDecks') return 'Library';
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

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (isDeleteHolding) {
            timer = setTimeout(() => {
                const id = isDeleteHolding;
                setIsDeleteHolding(null);
                if (id.startsWith('ws-')) void handleDeleteWorkspace(id.replace('ws-', ''));
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
        setIsCreateModalClosing(true);
        setTimeout(() => {
            setIsCreateModalOpen(false);
            setIsCreateModalClosing(false);
            setCreateName('');
        }, 200);
    };

    const handleCreateSave = async () => {
        if (!createName.trim()) return;
        setCreateSaving(true);
        try {
            await db.createWorkspace(createName.trim(), '#3B82F6', undefined);
            closeCreateModal();
            void load({ isRefresh: true });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Create failed');
        } finally {
            setCreateSaving(false);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-background" onClick={closeMenu}>
            {/* Sticky Header exactly as in dashvis */}
            <div className="sticky top-14 md:top-0 z-10 bg-surface">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Library</h1>
                            <p className="text-foreground-secondary">Manage and organize all your study materials here.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">New Library</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">{error}</p>
                    )}
                </div>

                <div className="border-b border-border w-full">
                    <div className="max-w-4xl mx-auto px-6 flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 font-medium transition-all relative ${
                                    activeTab === tab
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

            <div className="max-w-4xl mx-auto px-6 py-8 pb-40">
                {activeTab === 'Library' && (
                    <div>
                        <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-4">Library</h4>
                        {loading || decksLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface-hover/40 border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : workspaces.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-3 p-4 border border-border border-dashed rounded-2xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50 w-full transition-all"
                            >
                                <Plus size={20} />
                                <span className="font-medium">New Library</span>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {workspaces.map((ws) => (
                                    <div
                                        key={ws.id}
                                        className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/50 transition-all shadow-sm relative"
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
                                                className={`p-2 rounded-full transition-all duration-300 ${
                                                    activeMenuId === `ws-${ws.id}`
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
                                                        onClick={() => openRename(ws.id, ws.name, 'myDecks')}
                                                    >
                                                        <Edit2 size={16} className="text-zinc-500 shrink-0" />
                                                        Rename
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
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface-hover/20">
                                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Mic size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">No lectures yet</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm font-medium">
                                    Your recorded lectures and transcripts will appear here.
                                </p>
                            </div>
                        ) : (
                            lectures.map((n) => (
                                <div
                                    key={n.id}
                                    className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm relative cursor-pointer"
                                    onClick={() => navigate(`/dashboard/transcripts/${n.id}`)}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
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
                                    </div>
                                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-brand-primary transition-colors" />
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
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-surface-hover/20">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                                    <BookMarked size={32} className="text-amber-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">No study guides yet</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm font-medium">
                                    Generated study guides from your account will appear here.
                                </p>
                            </div>
                        ) : (
                            studyGuides.map((g) => (
                                <div
                                    key={g.id}
                                    className="flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <BookMarked size={20} className="text-amber-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-foreground mb-1 truncate">{g.title}</h3>
                                            {g.topic && <p className="text-sm text-foreground-secondary font-medium truncate">{g.topic}</p>}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-zinc-300" />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal - dashvis style */}
            {(isCreateModalOpen || isCreateModalClosing) && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeCreateModal} />
                    <div className={`bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 ${isCreateModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">New Library</h3>
                            <button onClick={closeCreateModal} className="p-2 hover:bg-surface-hover rounded-full text-foreground-secondary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Library Name</label>
                                <input
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:outline-none focus:border-brand-primary transition-colors"
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                    placeholder="e.g. Biology 101"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCreateSave}
                                disabled={createSaving || !createName.trim()}
                                className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {createSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Create Library
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal - dashvis style */}
            {(isRenameModalOpen || isRenameModalClosing) && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeRenameModal} />
                    <div className={`bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 ${isRenameModalClosing ? 'popover-modal-closing' : 'popover-modal-animate'}`}>
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
        </div>
    );
}
