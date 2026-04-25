import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, FolderPlus, Sparkles, Flame, Sun, Moon, Bell, Mic, Layers, FileText, FileUp, ClipboardPaste } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { CreateModal } from '../components/CreateModal';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { RecentDeckCard } from '../components/ui/RecentDeckCard';
import { useDecks } from '../contexts/DecksContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';

export default function DashboardPage() {
    const navigate = useNavigate();
    const {
        createFolder,
        getActiveDecks,
        setActiveDeck
    } = useDecks();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { getStreak, getDeckStats } = useStudyProgress();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isStreakMenuOpen, setIsStreakMenuOpen] = useState(false);

    // Mock username for now, in a real app this would come from a user context
    const username = "Kortez";
    const streak = getStreak();

    // Get recent decks
    const activeDecks = getActiveDecks();
    // const totalCards = activeDecks.reduce((sum, deck) => sum + deck.cards.length, 0); // Unused for now

    const recentDecks = activeDecks
        .sort((a, b) => {
            const dateA = new Date(a.lastStudied || a.createdAt).getTime();
            const dateB = new Date(b.lastStudied || b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, 4); // Increased to 4 to fit grid better on responsive

    const handleDeckClick = (deckId: string) => {
        setActiveDeck(deckId);
        navigate(`/dashboard/decks/${deckId}`);
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
        <div className="p-8 max-w-7xl mx-auto min-h-screen h-screen overflow-hidden" onClick={() => {
            setIsAddMenuOpen(false);
            setIsNotificationOpen(false);
            setIsStreakMenuOpen(false);
        }}>
            {/* Header Row */}
            <div className="flex items-center justify-between mb-12">
                <FadeInUp>
                    <h1 className="text-3xl font-bold text-foreground-muted">
                        Welcome, <span className="text-white font-black">{username}</span>
                    </h1>
                </FadeInUp>

                {/* Mini Utility Container */}
                <div className="flex items-center gap-2 p-1.5 bg-surface/50 backdrop-blur-md border border-border rounded-2xl shadow-sm relative z-20">
                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(var(--brand-primary), 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-foreground-muted hover:text-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>

                    <div className="w-px h-6 bg-border" />



                    {/* Streak Counter */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStreakMenuOpen(!isStreakMenuOpen);
                                setIsAddMenuOpen(false); // Close other menu
                                setIsNotificationOpen(false);
                            }}
                            className={`h-10 px-3 flex items-center gap-2 rounded-xl bg-orange-500/10 text-orange-500 font-bold text-sm min-w-[3rem] justify-center hover:bg-orange-500/20 transition-colors ${isStreakMenuOpen ? 'ring-2 ring-orange-500/20' : ''}`}
                            title="Streak"
                        >
                            <Flame className="w-4 h-4 fill-current" />
                            <span>{streak}</span>
                        </motion.button>

                        <AnimatePresence>
                            {isStreakMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                    className="absolute top-full right-0 mt-3 w-80 bg-background-elevated/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden z-50 ring-1 ring-white/5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-6 text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-inner ring-1 ring-white/10">
                                                <Flame className="w-10 h-10 fill-current drop-shadow-lg" />
                                            </div>
                                            <h3 className="text-3xl font-black text-foreground mb-1 tracking-tight">{streak} Day Streak!</h3>
                                            <p className="text-sm font-medium text-foreground-secondary">You're on fire! 🔥</p>
                                        </div>
                                    </div>

                                    <div className="p-5 border-t border-white/5 bg-white/2">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Daily Goal</span>
                                            <span className="text-xs font-bold text-foreground">3/5 cards</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-surface/50 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                        </div>
                                        <p className="text-xs text-center text-foreground-muted mt-4 font-medium leading-relaxed">Study <span className="text-orange-500 font-bold">2 more cards</span> to keep your streak alive.</p>
                                    </div>

                                    <div className="p-3 border-t border-white/5 bg-black/20 backdrop-blur-md">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsStreakMenuOpen(false);
                                                navigate('/dashboard/streak');
                                            }}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            View Full Calendar
                                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-border" />

                    {/* Quick Add Button */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAddMenuOpen(!isAddMenuOpen);
                                setIsNotificationOpen(false);
                                setIsStreakMenuOpen(false);
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-all border border-white/10"
                            title="Create New"
                        >
                            <Plus className={`w-5 h-5 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : ''}`} />
                        </motion.button>

                        <AnimatePresence>
                            {isAddMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                                    className="absolute top-full right-0 mt-3 w-56 bg-background-elevated border border-border rounded-2xl shadow-2xl overflow-hidden py-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard/decks?tab=lectures');
                                            setIsAddMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <span>Record Lecture</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsAddMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                            <FileUp className="w-4 h-4" />
                                        </div>
                                        <span>Upload Content</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsAddMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <span>Paste Notes</span>
                                    </button>

                                    <div className="h-px bg-border my-1 mx-2" />

                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsAddMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <span>Write Manually</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>


            {/* Recent Decks Section */}
            {recentDecks.length > 0 && (
                <FadeInUp delay={0.1} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">Pick up where you left off</h2>
                        <button
                            onClick={() => navigate('/dashboard/decks')}
                            className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentDecks.map((d, index) => {
                            const stats = getDeckStats(
                                d.id,
                                d.cards.map((c) => c.id),
                            );
                            return (
                                <RecentDeckCard
                                    key={d.id}
                                    deck={d}
                                    stats={stats}
                                    delay={(index) * 0.05}
                                    handleDeckClick={handleDeckClick}
                                    formatLastStudied={formatLastStudied}
                                />
                            );
                        })}
                    </div>
                </FadeInUp>
            )}

            {/* Create Section */}
            <FadeInUp delay={0.3} className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6">Create</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Upload Card */}
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-surface border border-dashed border-brand-primary/50 relative overflow-hidden group hover:border-brand-primary transition-all cursor-pointer rounded-3xl p-5 h-full hover:bg-surface-hover"
                    >
                        <div className="absolute top-3 right-3 bg-brand-primary/20 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Ultra
                        </div>
                        <div className="mb-4 p-3 bg-brand-primary/10 text-brand-primary rounded-2xl w-fit">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm mb-1">
                            Upload a PDF, PPT, Video, or Audio
                        </h3>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                            Get flashcards or notes instantly.
                        </p>
                    </div>

                    {/* Live Recording Card */}
                    <div className="bg-surface border border-border relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer rounded-3xl p-5 hover:bg-surface-hover h-full">
                        <div className="absolute top-3 right-3 bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Ultra
                        </div>
                        <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit">
                            <Mic className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm mb-1">
                            Create from live recording
                        </h3>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                            Start a live lecture recording now.
                        </p>
                    </div>

                    {/* Manual Flashcards Card */}
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-surface border border-border relative overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer rounded-3xl p-5 hover:bg-surface-hover h-full"
                    >
                        <div className="mb-4 p-3 bg-orange-500/10 text-orange-500 rounded-2xl w-fit">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm mb-1">
                            Create flashcards manually
                        </h3>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                            Create flashcards without AI for free.
                        </p>
                    </div>

                    {/* Manual Notes Card */}
                    <div className="bg-surface border border-border relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer rounded-3xl p-5 hover:bg-surface-hover h-full">
                        <div className="mb-4 p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm mb-1">
                            Create notes manually
                        </h3>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                            Create notes without AI for free.
                        </p>
                    </div>

                </div>
            </FadeInUp>
            {/* Modals */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={(name, color) => createFolder(name, color)}
            />
        </div>
    );
}
