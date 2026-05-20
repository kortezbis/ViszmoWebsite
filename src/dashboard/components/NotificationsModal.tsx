import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, BookOpen, Podcast, AlertCircle, Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function typeIcon(type: string) {
    switch (type) {
        case 'streak':  return { Icon: Flame,        color: 'text-orange-500', bg: 'bg-orange-500/10' };
        case 'deck':    return { Icon: BookOpen,      color: 'text-blue-500',   bg: 'bg-blue-500/10'   };
        case 'podcast': return { Icon: Podcast,       color: 'text-brand-primary', bg: 'bg-brand-primary/10' };
        default:        return { Icon: AlertCircle,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const { resolvedTheme } = useTheme();
    const { notifications, markAllRead, markRead, unreadCount } = useNotifications();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/10 shadow-2xl flex flex-col max-h-[80vh] ${
                            resolvedTheme === 'dark' ? 'bg-[#111112] text-zinc-100' : 'bg-white text-zinc-900'
                        }`}
                    >
                        {/* Background subtle accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[80px] pointer-events-none" />

                        {/* Header */}
                        <div className="relative p-6 pb-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
                                    <Bell className="w-5 h-5 animate-swing" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                                    <p className="text-xs text-foreground-secondary mt-0.5 font-medium">Your streaks, achievements, and podcast updates.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-hover text-xs font-bold text-brand-primary transition-all active:scale-95"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="relative flex-1 overflow-y-auto p-6 space-y-3 min-h-0">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-foreground-muted" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
                                    <p className="text-foreground-secondary text-sm max-w-xs mt-1 font-medium">
                                        Your study progress, new deck shares, and podcast logs will appear here.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const { Icon, color, bg } = typeIcon(n.type);
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => markRead(n.id)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${
                                                n.read
                                                    ? 'bg-zinc-50/50 dark:bg-white/[0.01] border-transparent'
                                                    : 'bg-brand-primary/[0.02] border-brand-primary/20 shadow-lg shadow-brand-primary/5'
                                            }`}
                                        >
                                            <div className="flex gap-4 items-start">
                                                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex items-start justify-between gap-2 mb-0.5">
                                                        <h4 className={`font-bold text-sm truncate ${n.read ? 'text-foreground' : 'text-brand-primary'}`}>
                                                            {n.title}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-foreground-muted bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-foreground-secondary text-xs leading-relaxed font-medium">{n.message}</p>
                                                </div>
                                                {!n.read && (
                                                    <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 shrink-0 animate-ping" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
