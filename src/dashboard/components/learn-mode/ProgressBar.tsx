import { motion } from 'framer-motion';

interface ProgressBarProps {
    currentRound: number;
    currentCardIndex: number;
    totalCards: number;
}

export function ProgressBar({ currentRound, currentCardIndex, totalCards }: ProgressBarProps) {
    const progress = (currentCardIndex / totalCards) * 100;

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Round</span>
                    <span className="text-xl font-black text-brand-primary">{currentRound}</span>
                    <span className="text-foreground-muted font-bold">/ 3</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Progress</span>
                    <span className="text-xl font-black text-foreground">{currentCardIndex + 1}</span>
                    <span className="text-foreground-muted font-bold">/ {totalCards}</span>
                </div>
            </div>

            <div className="h-2 w-full bg-surface-active rounded-full overflow-hidden border border-border/50 shadow-inner">
                <motion.div
                    className="h-full bg-brand-primary shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
