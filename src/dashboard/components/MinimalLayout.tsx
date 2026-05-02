import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    MessageSquare,
    ScrollText,
    LogOut,
    Sun,
    Moon,
    Menu,
    X,
    BrainCircuit,
    Layers,
    Zap,
    Puzzle,
    PenTool,
    Mic,
    ClipboardCheck,
} from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../contexts/ThemeContext';

interface MinimalLayoutProps {
    children: ReactNode;
}

const MAIN_LINKS: { to: string; label: string; icon: typeof Home }[] = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/dashboard/decks', label: 'Library', icon: BookOpen },
    { to: '/dashboard/transcripts', label: 'Transcripts', icon: ScrollText },
    { to: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
];

const STUDY_MODES: { name: string; path: string; icon: typeof Layers }[] = [
    { name: 'Learn', path: '/dashboard/learn', icon: BrainCircuit },
    { name: 'Flashcards', path: '/dashboard/flashcards', icon: Layers },
    { name: 'Rapid Fire', path: '/dashboard/quiz', icon: Zap },
    { name: 'Matching', path: '/dashboard/match', icon: Puzzle },
    { name: 'Written', path: '/dashboard/written', icon: PenTool },
    { name: 'Speaking Drill', path: '/dashboard/speaking', icon: Mic },
    { name: 'Practice Test', path: '/dashboard/test', icon: ClipboardCheck },
];

/**
 * Simpler app shell: same routes as the classic layout, no Framer or glass styling.
 * Keeps sidebar / mobile drawer behavior and hideSidebar (games, canvas) compatible.
 */
export function MinimalLayout({ children }: MinimalLayoutProps) {
    const { hideSidebar } = useSidebar();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { userEmail, userName, userImageUrl, signOut } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();

    const isPathActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {!hideSidebar && (
                <>
                    {mobileOpen && (
                        <button
                            type="button"
                            className="fixed inset-0 z-[55] bg-black/40 md:hidden"
                            aria-label="Close menu"
                            onClick={() => setMobileOpen(false)}
                        />
                    )}
                    <header className="md:hidden fixed top-0 left-0 right-0 z-[58] h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur">
                        <Link to="/dashboard" className="text-lg font-bold tracking-tight text-foreground">
                            Viszmo
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileOpen((o) => !o)}
                            className="p-2 rounded-lg border border-border text-foreground hover:bg-surface-hover"
                            aria-expanded={mobileOpen}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </header>
                </>
            )}

            {!hideSidebar && (
                <aside
                    className={`sidebar z-[60] border-r border-border flex flex-col transition-transform duration-200 ease-out
                        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}
                    style={{
                        background: resolvedTheme === 'dark' ? '#111112' : '#ffffff',
                    }}
                >
                    <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
                        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
                            <img
                                src="/viszmofull.png"
                                alt="Viszmo"
                                className="h-7 object-contain"
                                style={resolvedTheme !== 'dark' ? { filter: 'brightness(0)' } : undefined}
                            />
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        <p className="px-2 mb-2 text-xs font-bold text-foreground-muted uppercase tracking-wider">Menu</p>
                        <div className="space-y-1">
                            {MAIN_LINKS.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={isPathActive(to) ? 'sidebar-item-active' : 'sidebar-item'}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span className="whitespace-nowrap">{label}</span>
                                </Link>
                            ))}
                        </div>

                        <p className="px-2 mt-6 mb-2 text-xs font-bold text-foreground-muted uppercase tracking-wider">Practice</p>
                        <div className="space-y-1">
                            {STUDY_MODES.map(({ name, path, icon: Icon }) => (
                                <button
                                    key={path}
                                    type="button"
                                    onClick={() => {
                                        navigate(path);
                                        setMobileOpen(false);
                                    }}
                                    className={isPathActive(path) ? 'sidebar-item-active' : 'sidebar-item'}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{name}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="p-3 border-t border-border shrink-0 space-y-2 relative">
                        {userMenuOpen && (
                            <div
                                className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-border bg-background-card shadow-lg p-2 z-[70] text-left"
                                role="menu"
                            >
                                <p className="px-2 py-1.5 text-xs text-foreground-secondary truncate" title={userEmail ?? undefined}>
                                    {userName || userEmail || 'Account'}
                                </p>
                                <Link
                                    to="/account"
                                    className="block w-full text-left px-2 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-hover rounded-lg"
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        setMobileOpen(false);
                                    }}
                                >
                                    Account
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        toggleTheme();
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-hover rounded-lg"
                                >
                                    {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setUserMenuOpen((o) => !o)}
                            className={`sidebar-item w-full ${userMenuOpen ? 'sidebar-item-active' : ''}`}
                            aria-expanded={userMenuOpen}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                                {userImageUrl ? (
                                    <img src={userImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (userName?.[0] || userEmail?.[0] || 'U').toUpperCase()
                                )}
                            </div>
                            <span className="font-medium truncate">You</span>
                        </button>
                    </div>
                </aside>
            )}

            {userMenuOpen && !hideSidebar && (
                <button
                    type="button"
                    className="fixed inset-0 z-[45] cursor-default bg-transparent"
                    aria-label="Close account menu"
                    onClick={() => setUserMenuOpen(false)}
                />
            )}

            <div
                className={
                    hideSidebar
                        ? 'min-h-screen w-full overflow-y-auto'
                        : 'min-h-screen w-full overflow-y-auto pt-14 md:pt-0 transition-[margin] duration-200 ease-out md:ml-[280px] md:w-[calc(100%-280px)]'
                }
            >
                {children}
            </div>
        </div>
    );
}
