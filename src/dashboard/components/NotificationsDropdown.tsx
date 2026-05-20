import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Flame, BookOpen, Podcast, AlertCircle, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useSidebar } from '../contexts/SidebarContext';

function typeIcon(type: string) {
    switch (type) {
        case 'streak':  return { Icon: Flame,        color: 'text-orange-500', bg: 'bg-orange-500/10' };
        case 'deck':    return { Icon: BookOpen,      color: 'text-blue-500',   bg: 'bg-blue-500/10'   };
        case 'podcast': return { Icon: Podcast,       color: 'text-brand-primary', bg: 'bg-brand-primary/10' };
        default:        return { Icon: AlertCircle,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
}

export function NotificationsDropdown() {
    const { notifications, markAllRead, markRead, unreadCount } = useNotifications();
    const { setIsNotificationsOpen } = useSidebar();
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

    return (
        <div ref={ref} className="relative">
            {/* Bell button trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="relative h-11 w-11 rounded-full hover:bg-surface-hover text-foreground-secondary hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                aria-label="Notifications"
            >
                <Bell size={20} className={open ? 'text-brand-primary' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#18181b]" />
                )}
            </button>

            {/* Dropdown Card */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="absolute top-full mt-2 right-0 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1.5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/5 dark:border-white/5 mb-1.5 mx-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-foreground">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:bg-red-500/20 text-[10px] font-bold">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAllRead();
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline transition-all"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Scrollable Body */}
                        <div className="max-h-[340px] overflow-y-auto space-y-1 px-1">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-foreground-muted" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">All caught up!</p>
                                    <p className="text-[11px] text-foreground-muted mt-0.5 max-w-[200px]">
                                        Your study streaks and podcast completions will show up here.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const { Icon, color, bg } = typeIcon(n.type);
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markRead(n.id);
                                            }}
                                            className={`w-full flex gap-3 p-3 rounded-xl transition-all text-left relative items-start hover:bg-zinc-100 dark:hover:bg-white/5 border ${
                                                n.read
                                                    ? 'border-transparent'
                                                    : 'bg-brand-primary/[0.02] border-brand-primary/10'
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                                    <h4 className={`text-xs font-bold truncate leading-none ${n.read ? 'text-foreground' : 'text-brand-primary'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[9px] font-medium text-foreground-muted shrink-0 leading-none">
                                                        {n.time}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-foreground-secondary leading-snug line-clamp-2">
                                                    {n.message}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <span className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-black/5 dark:border-white/5 mt-1.5 pt-1.5 px-1 pb-0.5">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    setIsNotificationsOpen(true);
                                }}
                                className="w-full py-2 text-center text-xs font-bold text-foreground-secondary hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
