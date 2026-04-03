import { useDebug } from '../contexts/DebugContext';

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../contexts/SidebarContext';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

import {
    BookOpen,
    User,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Home,
    Layers,
    BrainCircuit,
    Zap,
    Puzzle,
    PenTool,
    Mic,
    ClipboardCheck,
    ChevronUp,
    Scroll,

    Crown,
    Bell,
    Users,
    Settings,
    MoreHorizontal,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
// import { PixelTransition } from './PixelTransition';

interface LayoutProps {
    children: ReactNode;
}

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (v: boolean) => void;
    onSelectMode: (path: string) => void;
    hideSidebar: boolean;
}

function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isUserMenuOpen,
    setIsUserMenuOpen,
    onSelectMode,
    hideSidebar,
}: SidebarProps) {
    const location = useLocation();
    const { debugEmpty, toggleDebugEmpty } = useDebug();
    const { resolvedTheme, toggleTheme } = useTheme();
    const [showAllModes, setShowAllModes] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className={`sidebar z-[60] ${isCollapsed ? 'sidebar-collapsed' : ''} ${hideSidebar ? '-translate-x-full' : 'translate-x-0'}`}
        >
            {/* Logo & Toggle */}
            <div className={`h-16 flex items-center border-border ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <img src="/viszmofull.png" alt="Viszmo" className="h-8 object-contain invert dark:invert-0" />
                </div>
                {isCollapsed && <img src="/dashimages/viszmo.png" alt="V" className="h-20 w-20 object-contain invert dark:invert-0" />}
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-brand-primary transition-all shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-hidden">
                <div className="space-y-1">
                    {!isCollapsed && (
                        <div className="px-4 mb-2 text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Menu
                        </div>
                    )}
                    <Link
                        to="/dashboard"
                        className={`${isActive('/dashboard') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "Home" : ""}
                    >
                        <Home className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                Home
                            </span>
                        )}
                    </Link>
                    <Link
                        to="/dashboard/decks"
                        className={`${isActive('/dashboard/decks') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "My Decks" : ""}
                    >
                        <BookOpen className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                My Decks
                            </span>
                        )}
                    </Link>
                    <Link
                        to="/dashboard/transcripts"
                        className={`${isActive('/dashboard/transcripts') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "Transcripts" : ""}
                    >
                        <Scroll className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                Transcripts
                            </span>
                        )}
                    </Link>

                </div>

                {/* AI section hidden
                <div className="mt-6 space-y-1">
                    {!isCollapsed && (
                        <div className="px-4 mb-2 text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            AI
                        </div>
                    )}
                    <Link
                        to="/chat"
                        className={`${isActive('/chat') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "Chat" : ""}
                    >
                        <MessageSquare className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span>
                                Chat
                            </span>
                        )}
                    </Link>
                    <Link
                        to="/summarizers"
                        className={`${isActive('/summarizers') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "AI Summarizers" : ""}
                    >
                        <Wand2 className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span>
                                AI Summarizers
                            </span>
                        )}
                    </Link>
                </div>
                */}

                <div className="mt-6 space-y-1">
                    {!isCollapsed && (
                        <div className="px-4 mb-2 text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Study Modes
                        </div>
                    )}

                    <div className="space-y-1">
                        {/* Always visible modes */}
                        {[
                            { name: 'Learn', icon: BrainCircuit, path: '/dashboard/learn' },
                            { name: 'Flashcards', icon: Layers, path: '/dashboard/flashcards' },
                            { name: 'Rapid Fire', icon: Zap, path: '/dashboard/quiz' },
                            { name: 'Matching', icon: Puzzle, path: '/dashboard/match' },
                        ].map((mode) => {
                            const isModeActive = isActive(mode.path);
                            return (
                                <button
                                    key={mode.path}
                                    onClick={() => onSelectMode(mode.path)}
                                    className={`${isModeActive ? 'sidebar-item-active' : 'sidebar-item'} w-full group relative ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? mode.name : ""}
                                >
                                    <mode.icon className="w-5 h-5 shrink-0" />
                                    {!isCollapsed && (
                                        <span>
                                            {mode.name}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* Collapsible modes */}
                        <AnimatePresence initial={false}>
                            {(isCollapsed || showAllModes) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden space-y-1"
                                >
                                    {[
                                        { name: 'Written', icon: PenTool, path: '/dashboard/written' },
                                        { name: 'Speaking Drill', icon: Mic, path: '/dashboard/speaking' },
                                        { name: 'Practice Test', icon: ClipboardCheck, path: '/dashboard/test' },
                                    ].map((mode) => {
                                        const isModeActive = isActive(mode.path);
                                        return (
                                            <button
                                                key={mode.path}
                                                onClick={() => onSelectMode(mode.path)}
                                                className={`${isModeActive ? 'sidebar-item-active' : 'sidebar-item'} w-full group relative ${isCollapsed ? 'justify-center' : ''}`}
                                                title={isCollapsed ? mode.name : ""}
                                            >
                                                <mode.icon className="w-5 h-5 shrink-0" />
                                                {!isCollapsed && (
                                                    <span>
                                                        {mode.name}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isCollapsed && (
                            <button
                                onClick={() => setShowAllModes(!showAllModes)}
                                className="sidebar-item w-full group relative !text-brand-primary/80 hover:!text-brand-primary"
                            >
                                {showAllModes ? (
                                    <>
                                        <ChevronUp className="w-5 h-5 shrink-0" />
                                        <span>Show Less</span>
                                    </>
                                ) : (
                                    <>
                                        <MoreHorizontal className="w-5 h-5 shrink-0" />
                                        <span>Show More</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Footer Section */}
            <div className={`p-4 border-t border-border flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>


                <Link to="/dashboard/notifications" className={`${isActive('/dashboard/notifications') ? 'sidebar-item-active' : 'sidebar-item'} mb-2 group relative`} title={isCollapsed ? "Notifications" : ""}>
                    <Bell className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                        <span>
                            Notifications
                        </span>
                    )}
                </Link>

                <div className="relative w-full">
                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", y: 20 }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)", y: 20 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="absolute bottom-0 left-full ml-6 w-64 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 text-left"
                            >
                                <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1.5 mx-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shadow-sm">
                                            K
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">Kortez</p>
                                            <p className="text-xs text-foreground-secondary truncate font-medium">kevjohnson032@gmail.com</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        window.location.href = '/';
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl"
                                >
                                    <Home className="w-4 h-4 text-zinc-500" />
                                    Return to Viszmo
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDebugEmpty();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl mb-1.5"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${debugEmpty ? 'bg-brand-primary border-brand-primary' : 'border-zinc-400'}`}>
                                        {debugEmpty && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    Debug Empty
                                </button>
                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                    <User className="w-4 h-4 text-zinc-500" />
                                    Profile
                                </button>
                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                    <Users className="w-4 h-4 text-zinc-500" />
                                    Refer Friends
                                </button>
                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                    <Settings className="w-4 h-4 text-zinc-500" />
                                    Settings
                                </button>

                                {/* App Settings Toggles */}
                                <div className="space-y-0.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTheme();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl group"
                                    >
                                        {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-zinc-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
                                        {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                </div>

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1"></div>

                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-xl">
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => {
                            setIsUserMenuOpen(!isUserMenuOpen);
                        }}
                        className={`sidebar-item w-full group relative mb-2 ${isCollapsed ? 'justify-center' : ''} ${isUserMenuOpen ? 'sidebar-item-active' : ''}`}
                        title={isCollapsed ? "My Account" : ""}
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border shadow-sm">
                            <img
                                src="https://lh3.googleusercontent.com/ogw/AF2bJyh-dG0s0XyX_zX0X0X0X0X0X0X0X0X0X0X0X0=s32-c-mo"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!isCollapsed && (
                            <span className="font-medium">
                                My Account
                            </span>
                        )}
                    </button>
                </div>

                <button
                    className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25 mt-2 ${isCollapsed ? 'px-0' : 'px-5'}`}
                    title={isCollapsed ? "Upgrade to Pro" : ""}
                >
                    <Crown className="w-5 h-5" />
                    {!isCollapsed && <span>Upgrade to Pro</span>}
                </button>
            </div>
        </aside>
    );
}

export function Layout({ children }: LayoutProps) {
    const { hideSidebar } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* <PixelTransition isActive={showTransition} onComplete={() => setShowTransition(false)} /> */}

            <AnimatePresence mode="wait">
                {!hideSidebar && (
                    <Sidebar
                        key="sidebar"
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                        onSelectMode={(path) => { window.location.href = path; }}
                        hideSidebar={hideSidebar}
                    />
                )}
            </AnimatePresence>

            {isUserMenuOpen && (
                <div
                    className="fixed inset-0 z-[45] bg-transparent"
                    onClick={() => {
                        setIsUserMenuOpen(false);
                    }}
                />
            )}

            <div
                className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${hideSidebar ? 'ml-0' : (isCollapsed ? 'ml-[80px]' : 'ml-[280px]')}`}
                style={{ width: hideSidebar ? '100%' : `calc(100% - ${isCollapsed ? 80 : 280}px)` }}
            >
                {children}
            </div>
        </div>
    );
}
