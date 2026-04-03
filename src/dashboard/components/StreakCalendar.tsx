import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useStudyProgress } from '../contexts/StudyProgressContext';

export function StreakCalendar() {
    const { dailyStats } = useStudyProgress();
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data for the strip (Week View)
    const weekDays = useMemo(() => {
        const curr = new Date();
        const first = curr.getDate() - curr.getDay() + 1; // First day is Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const next = new Date(curr.setDate(first + i));
            days.push(new Date(next));
        }
        return days;
    }, []);

    // Data for the full view (Month View)
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

        return { days, padding, year, month };
    }, [currentDate]);

    const studiedDates = useMemo(() => {
        return new Set(dailyStats.filter(s => s.cardsStudied > 0).map(s => s.date));
    }, [dailyStats]);

    const getDayKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getDayKeyFromParts = (day: number, month: number, year: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number, month: number, year: number) => {
        return day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
    };

    const formatDate = (date: Date) => {
        return {
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        };
    };

    const CompactView = () => (
        <motion.div
            layoutId="calendar-container"
            className="bg-surface/50 backdrop-blur-md border border-border rounded-3xl p-6 w-full cursor-pointer hover:bg-surface/70 transition-colors group"
            onClick={() => setIsExpanded(true)}
        >
            <div className="flex items-center justify-between mb-6">
                <motion.h3 layoutId="calendar-title" className="text-xl font-bold text-foreground">
                    {formatDate(new Date()).full}
                </motion.h3>
                <div className="flex items-center gap-2 text-foreground-muted group-hover:text-foreground transition-colors">
                    <span className="text-sm font-medium">View Full Calendar</span>
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {weekDays.map((date, i) => {
                    const formatted = formatDate(date);
                    const isCurrent = isToday(date);
                    const dateKey = getDayKey(date);
                    const hasStudied = studiedDates.has(dateKey);

                    return (
                        <div
                            key={i}
                            className={`
                                relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300
                                ${isCurrent
                                    ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(var(--brand-primary),0.15)]'
                                    : 'bg-surface border-transparent hover:border-border'
                                }
                            `}
                        >
                            <span className={`text-sm font-medium mb-1 ${isCurrent ? 'text-brand-primary' : 'text-foreground-secondary'}`}>
                                {formatted.weekday}
                            </span>
                            <span className={`text-lg font-bold ${isCurrent ? 'text-foreground' : 'text-foreground-muted'}`}>
                                {formatted.month} {formatted.day}
                            </span>

                            {hasStudied && (
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <div className="text-emerald-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <div className="text-orange-500">
                                        <Flame className="w-4 h-4 fill-current" />
                                    </div>
                                </div>
                            )}

                            {isCurrent && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute inset-0 border-2 border-brand-primary rounded-2xl pointer-events-none"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );

    const ExpandedView = () => {
        const selectedDateKey = getDayKey(selectedDate);
        const isSelectedStudied = studiedDates.has(selectedDateKey);

        return (
            <motion.div
                layoutId="calendar-container"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    className="bg-background-elevated border border-border rounded-3xl p-8 w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <motion.h3 layoutId="calendar-title" className="text-3xl font-black text-foreground mb-1">
                                    Study Streak
                                </motion.h3>
                                <p className="text-foreground-secondary">
                                    Keep the momentum going! You're doing great.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 hover:bg-surface rounded-full transition-colors text-foreground-muted hover:text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setCurrentDate(new Date(monthDays.year, monthDays.month - 1))}
                                className="p-2 hover:bg-surface rounded-full text-foreground-secondary transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xl font-bold text-foreground">
                                {new Date(monthDays.year, monthDays.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => setCurrentDate(new Date(monthDays.year, monthDays.month + 1))}
                                className="p-2 hover:bg-surface rounded-full text-foreground-secondary transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-4 mb-2 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-sm font-bold text-foreground-muted uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {monthDays.padding.map(i => <div key={`pad-${i}`} />)}
                            {monthDays.days.map(day => {
                                const dateKey = getDayKeyFromParts(day, monthDays.month, monthDays.year);
                                const isStudied = studiedDates.has(dateKey);
                                const today = new Date();
                                const isCurrent = day === today.getDate() && monthDays.month === today.getMonth() && monthDays.year === today.getFullYear();
                                const isDaySelected = isSelected(day, monthDays.month, monthDays.year);

                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelectedDate(new Date(monthDays.year, monthDays.month, day))}
                                        className={`
                                            aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer group
                                            ${isDaySelected
                                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105 z-20 ring-2 ring-white/20'
                                                : 'bg-surface hover:bg-surface-hover text-foreground'
                                            }
                                            ${isStudied && !isDaySelected
                                                ? 'ring-2 ring-orange-500/20 bg-orange-500/5'
                                                : ''
                                            }
                                        `}
                                    >
                                        <span className={`text-lg font-bold ${isDaySelected ? 'text-white' : ''}`}>
                                            {day}
                                        </span>

                                        {isStudied && (
                                            <div className={`mt-1 ${isDaySelected ? 'text-white/90' : 'text-orange-500'}`}>
                                                <Flame className="w-4 h-4 fill-current" />
                                            </div>
                                        )}

                                        {isCurrent && !isDaySelected && (
                                            <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Details Footer */}
                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground-secondary uppercase tracking-wide">Selected Date</p>
                            <h4 className="text-xl font-bold text-foreground">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h4>
                        </div>

                        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${isSelectedStudied ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-surface border-border text-foreground-muted'}`}>
                            {isSelectedStudied ? (
                                <>
                                    <div className="p-1 rounded-full bg-orange-500 text-white">
                                        <Flame className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <span className="block font-bold">Streak Active!</span>
                                        <span className="text-xs opacity-80">You studied on this day</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
                                        <span className="text-lg">💤</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold">No Activity</span>
                                        <span className="text-xs opacity-80">Rest day or missed</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <AnimatePresence mode="wait">
            {isExpanded ? <ExpandedView key="expanded" /> : <CompactView key="compact" />}
        </AnimatePresence>
    );
}
