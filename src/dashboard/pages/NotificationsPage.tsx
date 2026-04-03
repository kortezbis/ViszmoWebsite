import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { ArrowLeft, Flame, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
    const navigate = useNavigate();

    // Mock full notifications data
    const notifications = [
        {
            id: 1,
            title: "3 Day Streak!",
            message: "You're on fire! Keep studying to maintain your streak.",
            time: "2 hours ago",
            icon: Flame,
            color: "text-brand-primary",
            bg: "bg-brand-primary/10",
            read: false
        },
        {
            id: 2,
            title: "New Deck Created",
            message: "\"Biology 101\" was successfully created.",
            time: "Yesterday",
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            read: true
        },
        {
            id: 3,
            title: "Study Reminder",
            message: "It's time to review your \"French Vocabulary\" deck.",
            time: "2 days ago",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            read: true
        },
        {
            id: 4,
            title: "System Update",
            message: "StudyLayer has been updated with new features!",
            time: "3 days ago",
            icon: AlertCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            read: true
        },
        {
            id: 5,
            title: "Deck Completed",
            message: "You've mastered all cards in \"History 101\"!",
            time: "1 week ago",
            icon: CheckCircle2,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            read: true
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <FadeInUp>
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors text-foreground-secondary hover:text-foreground"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                </div>

                <div className="space-y-4">
                    {notifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 rounded-3xl border transition-all hover:bg-surface-hover group ${notification.read
                                    ? 'bg-surface border-border'
                                    : 'bg-surface border-brand-primary/30 shadow-lg shadow-brand-primary/5'
                                }`}
                        >
                            <div className="flex gap-5">
                                <div className={`w-12 h-12 rounded-2xl ${notification.bg} flex items-center justify-center ${notification.color} flex-shrink-0`}>
                                    <notification.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className={`font-bold text-lg ${notification.read ? 'text-foreground' : 'text-brand-primary'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs font-medium text-foreground-muted bg-surface-hover px-2 py-1 rounded-full">
                                            {notification.time}
                                        </span>
                                    </div>
                                    <p className="text-foreground-secondary leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <div className="text-center py-20 text-foreground-muted">
                        <p>No notifications yet</p>
                    </div>
                )}
            </FadeInUp>
        </div>
    );
}
