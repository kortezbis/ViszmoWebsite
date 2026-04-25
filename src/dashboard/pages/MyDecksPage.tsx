import { useState, useCallback, useEffect } from 'react';
import {
    Plus,
    Search,
    BookOpen,
    Folder,
    Trash2,
    RotateCcw,
    FileText,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../contexts/DecksContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { CreateModal } from '../components/CreateModal';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { RenameDeckModal } from '../components/RenameDeckModal';
import { MoveDeckModal } from '../components/MoveDeckModal';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { LiquidDeckCard } from '../components/ui/LiquidDeckCard';
import { FolderCard } from '../components/ui/FolderCard';
import { db, type LectureNote } from '../../services/database';

type Tab = 'decks' | 'lectures' | 'guides';

export default function MyDecksPage() {
    const navigate = useNavigate();
    const {
        decks,
        folders,
        getActiveDecks,
        getDeletedDecks,
        deleteDeck,
        restoreDeck,
        permanentlyDeleteDeck,
        duplicateDeck,
        updateDeck,
        setActiveDeck,
        createFolder,
        updateFolder,
        deleteFolder,
        moveDeckToFolder,
        exportDeck
    } = useDecks();
    const { getDeckStats } = useStudyProgress();

    const [searchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as Tab) || 'decks';
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Rename Modal State
    const [renameModal, setRenameModal] = useState<{
        isOpen: boolean;
        type: 'deck' | 'folder';
        id: string | number;
        currentName: string;
    }>({ isOpen: false, type: 'deck', id: '', currentName: '' });

    // Move Modal State
    const [moveModal, setMoveModal] = useState<{
        isOpen: boolean;
        deckId: string;
        deckName: string;
        currentFolderId: number | null;
    }>({ isOpen: false, deckId: '', deckName: '', currentFolderId: null });

    // Lectures/Transcripts State
    const [lectures, setLectures] = useState<LectureNote[]>([]);
    const [loadingLectures, setLoadingLectures] = useState(false);
    const [lecturesError, setLecturesError] = useState<string | null>(null);

    const loadLectures = useCallback(async () => {
        setLoadingLectures(true);
        setLecturesError(null);
        try {
            const list = await db.getLectureNotes();
            setLectures(list);
        } catch (e: unknown) {
            setLecturesError(e instanceof Error ? e.message : 'Could not load lectures');
        } finally {
            setLoadingLectures(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'lectures') {
            void loadLectures();
        }
    }, [activeTab, loadLectures]);

    const rawActiveDecks = getActiveDecks();
    const rawDeletedDecks = getDeletedDecks();


    const activeDecks = rawActiveDecks;
    const deletedDecks = rawDeletedDecks;


    // Filter decks by search query
    const filteredDecks = activeDecks.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );



    const handleDeleteDeck = (id: string) => {
        void deleteDeck(id);
        setOpenDropdownId(null);
    };



    const handleDeleteFolder = (id: number) => {
        deleteFolder(id);
        setOpenDropdownId(null);
    };

    const handleOpenRenameFolder = (id: number) => {
        const folder = folders.find(f => f.id === id);
        if (folder) {
            setRenameModal({
                isOpen: true,
                type: 'folder',
                id: id,
                currentName: folder.name
            });
        }
        setOpenDropdownId(null);
    };

    const handleOpenRenameDeck = (id: string) => {
        const deck = decks.find(d => d.id === id);
        if (deck) {
            setRenameModal({
                isOpen: true,
                type: 'deck',
                id: id,
                currentName: deck.title
            });
        }
        setOpenDropdownId(null);
    };

    const handleRename = (newName: string) => {
        if (renameModal.type === 'deck') {
            void updateDeck(renameModal.id as string, { title: newName });
        } else {
            updateFolder(renameModal.id as number, { name: newName });
        }
    };

    const handleOpenMoveModal = (id: string) => {
        const deck = decks.find(d => d.id === id);
        if (deck) {
            setMoveModal({
                isOpen: true,
                deckId: id,
                deckName: deck.title,
                currentFolderId: deck.folderId ?? null
            });
        }
        setOpenDropdownId(null);
    };

    const handleMoveDeck = (folderId: number | null) => {
        moveDeckToFolder(moveModal.deckId, folderId);
    };

    const handleShareDeck = (id: string) => {
        const exportData = exportDeck(id);
        if (exportData) {
            navigator.clipboard.writeText(exportData);
            // Could show a toast notification here
        }
        setOpenDropdownId(null);
    };

    const handleDuplicateDeck = (id: string) => {
        void duplicateDeck(id);
        setOpenDropdownId(null);
    };

    const handleCreateFolder = (name: string, color: string) => {
        createFolder(name, color);
    };

    const handleDeckClick = (deckId: string) => {
        setActiveDeck(deckId);
        navigate(`/dashboard/decks/${deckId}`);
    };

    const handleEditDeck = (e: React.MouseEvent, deckId: string) => {
        e.stopPropagation();
        setActiveDeck(deckId);
        navigate(`/dashboard/edit-deck/${deckId}`);
    };

    const formatLastStudied = (lastStudied?: string) => {
        if (!lastStudied) return 'Never';

        const date = new Date(lastStudied);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen" onClick={() => setOpenDropdownId(null)}>
            {/* Header */}
            <FadeInUp className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Library</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary min-w-[240px]"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Deck</span>
                    </button>
                </div>
            </FadeInUp>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border mb-8">
                <button
                    onClick={() => setActiveTab('decks')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'decks' ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    <div className="flex items-center gap-2">
                        <span>My Decks</span>
                    </div>
                    {activeTab === 'decks' && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"
                        />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('lectures')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'lectures' ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    <div className="flex items-center gap-2">
                        <span>Lectures</span>
                    </div>
                    {activeTab === 'lectures' && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"
                        />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('guides')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'guides' ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    <div className="flex items-center gap-2">
                        <span>Study Guides</span>
                    </div>
                    {activeTab === 'guides' && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"
                        />
                    )}
                </button>


            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {activeTab === 'decks' ? (
                    <>
                        {/* Create New Deck Card (Visual) */}
                        <FadeInUp delay={0.05}>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="border-2 border-dashed border-border hover:border-brand-primary hover:bg-surface-hover/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 group transition-all h-[220px] w-full"
                            >
                                <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-foreground-secondary group-hover:text-brand-primary">Create New Deck</span>
                            </button>
                        </FadeInUp>

                        {filteredDecks.map((d, index) => {
                            const stats = getDeckStats(
                                d.id,
                                d.cards.map((c) => c.id),
                            );
                            return (
                                <LiquidDeckCard
                                    key={d.id}
                                    deck={d}
                                    stats={stats}
                                    delay={(index + 2) * 0.05}
                                    openDropdownId={openDropdownId}
                                    setOpenDropdownId={setOpenDropdownId}
                                    handleDeckClick={handleDeckClick}
                                    handleEditDeck={handleEditDeck}
                                    handleShareDeck={handleShareDeck}
                                    handleOpenRenameDeck={handleOpenRenameDeck}
                                    handleDuplicateDeck={handleDuplicateDeck}
                                    handleOpenMoveModal={handleOpenMoveModal}
                                    handleDeleteDeck={handleDeleteDeck}
                                    formatLastStudied={formatLastStudied}
                                />
                            );
                        })}
                    </>

                ) : activeTab === 'lectures' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full"
                    >
                        {loadingLectures && (
                            <div className="flex flex-col items-center justify-center py-20 text-foreground-secondary">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <span>Loading lectures...</span>
                            </div>
                        )}

                        {lecturesError && !loadingLectures && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm mb-6">
                                {lecturesError}
                            </div>
                        )}

                        {!loadingLectures && !lecturesError && lectures.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-surface-active rounded-3xl flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 text-foreground-muted" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No lectures yet</h3>
                                <p className="text-foreground-secondary text-sm max-w-sm">
                                    Record or upload a lecture to see it here. They will automatically sync between your mobile and desktop devices.
                                </p>
                            </div>
                        )}

                        {!loadingLectures && !lecturesError && lectures.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {lectures
                                    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((lecture) => (
                                    <Link
                                        key={lecture.id}
                                        to={`/dashboard/transcripts/${lecture.id}`}
                                        className="flex items-center justify-between gap-4 w-full rounded-2xl border border-border bg-surface px-6 py-5 hover:bg-surface-hover hover:border-brand-primary/30 transition-all text-left group shadow-sm hover:shadow-md"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-foreground text-lg group-hover:text-brand-primary transition-colors line-clamp-1 mb-1">
                                                {lecture.title}
                                            </div>
                                            <div className="text-sm text-foreground-secondary flex items-center gap-2">
                                                <span>{lecture.date}</span>
                                                {lecture.duration && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span>{lecture.duration}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-surface-active group-hover:bg-brand-primary/10 flex items-center justify-center transition-colors">
                                            <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-brand-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-16 h-16 bg-surface-active rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-foreground-muted" />
                        </div>
                        <h3 className="font-bold text-lg">No study guides yet</h3>
                        <p className="text-foreground-secondary text-sm">Generated study guides will appear here.</p>
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={handleCreateFolder}
            />
            <RenameDeckModal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ ...renameModal, isOpen: false })}
                currentName={renameModal.currentName}
                onRename={handleRename}
                type={renameModal.type}
            />
            <MoveDeckModal
                isOpen={moveModal.isOpen}
                onClose={() => setMoveModal({ ...moveModal, isOpen: false })}
                deckName={moveModal.deckName}
                folders={folders}
                currentFolderId={moveModal.currentFolderId}
                onMove={handleMoveDeck}
                onCreateFolder={() => setIsCreateFolderModalOpen(true)}
            />
        </div >
    );
}
