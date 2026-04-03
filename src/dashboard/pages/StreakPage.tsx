import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { useNavigate } from 'react-router-dom';

export default function StreakPage() {
    const navigate = useNavigate();
    const { dailyStats } = useStudyProgress();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

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

    const getDayKeyFromParts = (day: number, month: number, year: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getDayKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isSelected = (day: number, month: number, year: number) => {
        return day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
    };

    const selectedDateKey = getDayKey(selectedDate);
    const isSelectedStudied = studiedDates.has(selectedDateKey);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <FadeInUp>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm font-medium text-foreground-muted hover:text-foreground mb-4 block"
                        >
                            ← Back
                        </button>
                        <h1 className="text-3xl font-black text-foreground mb-1">
                            Study Streak
                        </h1>
                        <p className="text-foreground-secondary">
                            Keep the momentum going! You're doing great.
                        </p>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-8 w-full shadow-lg relative overflow-hidden flex flex-col">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex-1">
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
                                            <div className={`mt-1 flex gap-1 items-center justify-center ${isDaySelected ? 'text-white/90' : 'text-orange-500'}`}>
                                                {!isDaySelected && <div className="text-emerald-500"><Check className="w-3 h-3" /></div>}
                                                <Flame className="w-3 h-3 fill-current" />
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
                </div>
            </FadeInUp>
        </div>
    );
}
