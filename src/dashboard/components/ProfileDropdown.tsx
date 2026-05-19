import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User, Home, Sun, Moon, Crown } from 'lucide-react';

interface ProfileDropdownProps {
    /** If true, the dropdown opens upward instead of downward */
    openUp?: boolean;
}

export function ProfileDropdown({ openUp = false }: ProfileDropdownProps) {
    const { userEmail, userName, userImageUrl, signOut } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const initial = (userName?.[0] || userEmail?.[0] || 'U').toUpperCase();

    return (
        <div ref={ref} className="relative">
            {/* Avatar trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-brand-primary/50 transition-all shadow-sm bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary hover:scale-105 active:scale-95"
                aria-label="Account menu"
            >
                {userImageUrl ? (
                    <img src={userImageUrl} alt={userName || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                    initial
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: openUp ? 8 : -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: openUp ? 8 : -8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className={`absolute ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-64 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1.5`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* User info header */}
                        <div className="px-3 py-2.5 border-b border-black/5 dark:border-white/5 mb-1.5 mx-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shadow-sm overflow-hidden shrink-0">
                                    {userImageUrl ? (
                                        <img src={userImageUrl} alt={userName || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{userName || 'User'}</p>
                                    <p className="text-xs text-foreground-secondary truncate font-medium">{userEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu items */}
                        <button
                            onClick={() => { window.location.href = '/'; setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                        >
                            <Home className="w-4 h-4 text-zinc-500" />
                            Return to Viszmo
                        </button>

                        <button
                            onClick={() => { navigate('/account'); setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                        >
                            <User className="w-4 h-4 text-zinc-500" />
                            Profile
                        </button>

                        <button
                            onClick={() => { navigate('/pricing'); setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                        >
                            <Crown className="w-4 h-4 text-amber-500" />
                            Upgrade to Pro
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl text-left"
                        >
                            {resolvedTheme === 'dark'
                                ? <Sun className="w-4 h-4 text-zinc-500" />
                                : <Moon className="w-4 h-4 text-zinc-500" />
                            }
                            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-xl text-left"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
