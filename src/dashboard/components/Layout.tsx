import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../contexts/SidebarContext';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PricingModal } from '../../components/PricingModal';
import { NotificationsModal } from './NotificationsModal';

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
    MessageSquare,

    Crown,
    Bell,
    Users,
    Settings,
    MoreHorizontal,
    Sun,
    Moon,
    Menu,
    Plus,
    X,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useDecks } from '../contexts/DecksContext';
import { CreateModal } from './CreateModal';
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
    sidebarOffScreen: boolean;
    isMdUp: boolean;
}

function Sidebar({
    isCollapsed,
    setIsCollapsed,
    isUserMenuOpen,
    setIsUserMenuOpen,
    onSelectMode,
    sidebarOffScreen,
    isMdUp,
}: SidebarProps) {
    const { userEmail, userName, userImageUrl, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsPricingOpen } = useSidebar();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };
    const { resolvedTheme, toggleTheme } = useTheme();
    const [showAllModes, setShowAllModes] = useState(false);
    const { workspaces } = useDecks();
    const mainWorkspaces = workspaces.filter(ws => !ws.parentId);

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className={`sidebar z-[60] border-r border-border flex flex-col transition-all duration-300 max-md:shadow-2xl ${isCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOffScreen ? '-translate-x-full' : 'translate-x-0'}`}
            style={{ 
                background: resolvedTheme === 'dark' ? '#111112' : '#ffffff',
                boxShadow: isCollapsed ? 'none' : '10px 0 40px rgba(0, 0, 0, 0.05)'
            }}
        >
            {/* Logo & Toggle Section (from dashvis) */}
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'} shrink-0 mb-2`}>
                <Link 
                    to="/dashboard" 
                    className={`flex items-center ${isCollapsed ? 'w-full justify-center' : 'pl-2'}`}
                >
                    {!isCollapsed ? (
                        <img 
                            src="/viszmofull.png" 
                            alt="Viszmo" 
                            className="h-8 object-contain" 
                            style={resolvedTheme !== 'dark' ? { filter: 'brightness(0)' } : {}}
                        />
                    ) : (
                        <img 
                            src="/viszmo.png" 
                            alt="Viszmo" 
                            className="h-16 w-16 object-contain mx-auto scale-150" 
                            style={resolvedTheme !== 'dark' ? { filter: 'brightness(0)' } : {}}
                        />
                    )}
                </Link>
                {!isCollapsed && isMdUp && (
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
                        aria-label="Collapse Sidebar"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {isCollapsed && isMdUp && (
                <div className="flex justify-center mt-4 mb-2">
                    <button 
                        onClick={() => setIsCollapsed(false)}
                        className="p-2 rounded-lg hover:bg-surface-hover text-[#0ea5e9] transition-colors"
                        aria-label="Expand Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            )}

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
                        className={`${location.pathname.startsWith('/dashboard/decks') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "Library" : ""}
                    >
                        <Layers className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                Library
                            </span>
                        )}
                    </Link>
                    <Link
                        to="/dashboard/chat"
                        className={`${isActive('/dashboard/chat') ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                        title={isCollapsed ? "Chat" : ""}
                    >
                        <MessageSquare className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap">
                                Chat
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

                {/* Practice section removed to clean up sidebar */}
                
                {/* Dynamic Workspace / Decks List */}
                <div className="mt-6">
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            {mainWorkspaces.map((ws) => (
                                <Link
                                    key={ws.id}
                                    to={`/dashboard/workspaces/${ws.id}`}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                        location.pathname === `/dashboard/workspaces/${ws.id}`
                                            ? 'bg-surface-hover text-brand-primary'
                                            : 'hover:bg-surface-hover text-foreground-secondary'
                                    }`}
                                    title={ws.name}
                                >
                                    <div
                                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                                        style={{ backgroundColor: ws.color }}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between px-4 mb-2">
                                <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider whitespace-nowrap">
                                    decks
                                </span>
                            </div>
                            <div className="space-y-1">
                                {mainWorkspaces.map((ws) => (
                                    <Link
                                        key={ws.id}
                                        to={`/dashboard/workspaces/${ws.id}`}
                                        className={`${location.pathname === `/dashboard/workspaces/${ws.id}` ? 'sidebar-item-active' : 'sidebar-item'} group relative`}
                                    >
                                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                            <div
                                                className="w-3.5 h-3.5 rounded-full shadow-sm"
                                                style={{ backgroundColor: ws.color }}
                                            />
                                        </div>
                                        <span className="truncate font-bold text-sm whitespace-nowrap">
                                            {ws.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Footer Section */}
            <div className={`p-4 flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>




                <button
                    onClick={() => setIsPricingOpen(true)}
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
    const { hideSidebar, isPricingOpen, setIsPricingOpen, isNotificationsOpen, setIsNotificationsOpen } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isMdUp, setIsMdUp] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
    );
    const navigate = useNavigate();
    const location = useLocation();
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => {
            setIsMdUp(mq.matches);
            if (mq.matches) setMobileNavOpen(false);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

    const effectiveCollapsed = isMdUp && isCollapsed;
    const sidebarOffScreen = hideSidebar || (!isMdUp && !mobileNavOpen);
    const mainMarginLeft =
        hideSidebar ? 'ml-0' : isMdUp ? (isCollapsed ? 'ml-[80px]' : 'ml-[240px]') : 'ml-0';
    const mainWidth =
        hideSidebar ? '100%' : isMdUp ? `calc(100% - ${isCollapsed ? 80 : 240}px)` : '100%';

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* <PixelTransition isActive={showTransition} onComplete={() => setShowTransition(false)} /> */}

            {!hideSidebar && !isMdUp && (
                <>
                    {mobileNavOpen && (
                        <button
                            type="button"
                            className="fixed inset-0 z-[55] bg-black/40 md:hidden"
                            aria-label="Close menu"
                            onClick={() => setMobileNavOpen(false)}
                        />
                    )}
                    <header className="md:hidden fixed top-0 left-0 right-0 z-[58] h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur">
                        <Link to="/dashboard" className="flex items-center min-w-0 py-1">
                            <img
                                src="/viszmofull.png"
                                alt="Viszmo"
                                className="h-7 object-contain max-w-[140px]"
                                style={resolvedTheme !== 'dark' ? { filter: 'brightness(0)' } : {}}
                            />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen((o) => !o)}
                            className="p-2 rounded-lg border border-[#0ea5e9]/30 text-[#0ea5e9] hover:bg-sky-500/10 transition-colors"
                            aria-expanded={mobileNavOpen}
                            aria-label="Toggle menu"
                        >
                            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </header>
                </>
            )}

            <AnimatePresence mode="wait">
                {!hideSidebar && (
                    <Sidebar
                        key="sidebar"
                        isCollapsed={effectiveCollapsed}
                        setIsCollapsed={setIsCollapsed}
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                        onSelectMode={(path) => { navigate(path); }}
                        sidebarOffScreen={sidebarOffScreen}
                        isMdUp={isMdUp}
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
            className={`flex-1 h-screen overflow-hidden transition-all duration-300 ${mainMarginLeft} ${!hideSidebar && !isMdUp ? 'pt-14' : ''}`}
            style={{ width: mainWidth }}
            >
                {children}
            </div>

            {/* Premium Global Modals */}
            <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>
    );
}
