import { useDebug } from '../contexts/DebugContext';
import {
    Plus,
    Search,
    BookOpen,
    Folder,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useState } from 'react';

type Tab = 'decks' | 'folders' | 'trash';

export default function MyDecksPage() {
    const navigate = useNavigate();
    const { debugEmpty } = useDebug();
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

    const [activeTab, setActiveTab] = useState<Tab>('decks');
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

    const rawActiveDecks = getActiveDecks();
    const rawDeletedDecks = getDeletedDecks();
    const rawFolders = folders;

    const activeDecks = debugEmpty ? [] : rawActiveDecks;
    const deletedDecks = debugEmpty ? [] : rawDeletedDecks;
    const currentFolders = debugEmpty ? [] : rawFolders;

    // Filter decks by search query
    const filteredDecks = activeDecks.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = currentFolders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteDeck = (id: string) => {
        deleteDeck(id);
        setOpenDropdownId(null);
    };

    const handleRestoreDeck = (id: string) => {
        restoreDeck(id);
        setOpenDropdownId(null);
    };

    const handlePermanentDeleteDeck = (id: string) => {
        permanentlyDeleteDeck(id);
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
            updateDeck(renameModal.id as string, { title: newName });
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
        duplicateDeck(id);
        setOpenDropdownId(null);
    };

    const handleCreateFolder = (name: string, color: string) => {
        createFolder(name, color);
    };

    const handleDeckClick = (deckId: string) => {
        setActiveDeck(deckId);
        navigate('/dashboard/flashcards');
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
                    <p className="text-foreground-secondary mt-1">Manage your decks and folders</p>
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
                        onClick={() => activeTab === 'decks' ? setIsCreateModalOpen(true) : setIsCreateFolderModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{activeTab === 'decks' ? 'Create Deck' : 'Create Folder'}</span>
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
                        <BookOpen className="w-4 h-4" />
                        <span>Decks</span>
                        <span className="bg-surface-active px-2 py-0.5 rounded-full text-xs">{activeDecks.length}</span>
                    </div>
                    {activeTab === 'decks' && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('folders')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'folders' ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span>Folders</span>
                        <span className="bg-surface-active px-2 py-0.5 rounded-full text-xs">{folders.length}</span>
                    </div>
                    {activeTab === 'folders' && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'trash' ? 'text-brand-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Trash</span>
                        <span className="bg-surface-active px-2 py-0.5 rounded-full text-xs">{deletedDecks.length}</span>
                    </div>
                    {activeTab === 'trash' && (
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
                            const stats = getDeckStats(d.id, d.cards.length);
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
                ) : activeTab === 'folders' ? (
                    <>
                        {/* Create New Folder Card */}
                        <FadeInUp delay={0.05}>
                            <button
                                onClick={() => setIsCreateFolderModalOpen(true)}
                                className="relative h-[220px] w-full group cursor-pointer flex flex-col items-center justify-center gap-4 transition-all"
                            >
                                {/* Dashed Outline Layer */}
                                <div className="absolute inset-0 transition-opacity">
                                    {/* Back Body Outline */}
                                    <div className="absolute inset-x-0 bottom-0 top-3 border-2 border-dashed border-border rounded-2xl group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all" />

                                    {/* Tab Outline */}
                                    <div className="absolute top-0 left-0 w-[40%] h-8 border-2 border-dashed border-border border-b-0 rounded-t-2xl group-hover:border-brand-primary group-hover:bg-brand-primary/5 transition-all bg-background" />

                                    {/* Hiding line between tab and body - optional boost to clean look */}
                                    <div className="absolute top-3 left-[2px] w-[calc(40%-4px)] h-[2px] bg-background z-10 group-hover:bg-brand-primary/5 transition-colors" />
                                </div>

                                {/* Content */}
                                <div className="relative z-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-foreground-secondary group-hover:text-brand-primary">Create New Folder</span>
                                </div>
                            </button>
                        </FadeInUp>

                        {filteredFolders.map((f, index) => {
                            const decksInFolder = activeDecks.filter(d => d.folderId === f.id);
                            return (
                                <FolderCard
                                    key={f.id}
                                    folder={f as any}
                                    decksCount={decksInFolder.length}
                                    delay={(index + 2) * 0.05}
                                    openDropdownId={openDropdownId}
                                    setOpenDropdownId={setOpenDropdownId}
                                    handleOpenRenameFolder={handleOpenRenameFolder}
                                    handleDeleteFolder={handleDeleteFolder}
                                />
                            );
                        })}
                    </>
                ) : (
                    <AnimatePresence>
                        {/* Trash Content */}
                        {deletedDecks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-16 h-16 bg-surface-active rounded-full flex items-center justify-center mb-4">
                                    <Trash2 className="w-8 h-8 text-foreground-muted" />
                                </div>
                                <h3 className="font-bold text-lg">Trash is empty</h3>
                                <p className="text-foreground-secondary text-sm">Items moved to trash will appear here.</p>
                            </motion.div>
                        ) : (
                            deletedDecks.map((d, index) => (
                                <motion.div
                                    key={d.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="bg-surface border border-border rounded-2xl p-6 opacity-75 hover:opacity-100 transition-all flex flex-col justify-between h-[220px] group">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center`}>
                                                    <BookOpen className="w-6 h-6 text-gray-500" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => handleRestoreDeck(d.id)}
                                                        whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--brand-primary), 0.15)" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="p-2 rounded-lg text-foreground-muted hover:text-brand-primary transition-colors"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handlePermanentDeleteDeck(d.id)}
                                                        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="p-2 rounded-lg text-foreground-muted hover:text-error transition-colors"
                                                        title="Delete Forever"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground line-clamp-1 mb-1 group-hover:text-brand-primary transition-colors">{d.title}</h3>
                                            <p className="text-sm text-foreground-secondary">{d.cards.length} cards</p>
                                        </div>
                                        <div className="pt-4 border-t border-border/50 text-xs font-bold text-error flex justify-between items-center">
                                            <span>Deleted {d.deletedAt ? new Date(d.deletedAt).toLocaleDateString() : 'recently'}</span>
                                            <span className="text-[10px] bg-error/10 px-2 py-0.5 rounded-full">3 days left</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
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
