import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, BookOpen, Podcast, AlertCircle, Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import { SEO } from '../components/SEO';

function typeIcon(type: string) {
    switch (type) {
        case 'streak':  return { Icon: Flame,        color: 'text-orange-500', bg: 'bg-orange-500/10' };
        case 'deck':    return { Icon: BookOpen,      color: 'text-blue-500',   bg: 'bg-blue-500/10'   };
        case 'podcast': return { Icon: Podcast,       color: 'text-brand-primary', bg: 'bg-brand-primary/10' };
        default:        return { Icon: AlertCircle,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
}

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { notifications, markAllRead, markRead, unreadCount } = useNotifications();

    return (
        <div className="w-full h-full overflow-y-auto bg-background">
            <SEO title="Notifications" description="Your Viszmo notifications and alerts." />

            <div className="max-w-4xl mx-auto px-6 py-10 pb-40">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors text-foreground-secondary hover:text-foreground"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Bell className="w-6 h-6 text-foreground" />
                            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-foreground-muted" />
                        </div>
                        <p className="text-foreground-secondary font-medium">No notifications yet</p>
                        <p className="text-foreground-muted text-sm mt-1">Podcast completions and streaks will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n, index) => {
                            const { Icon, color, bg } = typeIcon(n.type);
                            return (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => markRead(n.id)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer hover:bg-surface-hover ${
                                        n.read
                                            ? 'bg-surface border-border'
                                            : 'bg-surface border-brand-primary/30 shadow-lg shadow-brand-primary/5'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <h3 className={`font-bold text-base ${n.read ? 'text-foreground' : 'text-brand-primary'}`}>
                                                    {n.title}
                                                </h3>
                                                <span className="text-xs font-medium text-foreground-muted bg-surface-hover px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                                                    {n.time}
                                                </span>
                                            </div>
                                            <p className="text-foreground-secondary text-sm leading-relaxed">{n.message}</p>
                                        </div>
                                        {!n.read && (
                                            <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 shrink-0" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
