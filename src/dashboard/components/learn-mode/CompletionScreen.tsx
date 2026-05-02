import { motion } from 'framer-motion';
import { Trophy, ArrowRight, RotateCcw, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { type LearnCard } from './types';

interface CompletionScreenProps {
    masteredCards: LearnCard[];
    missedCards: LearnCard[];
    totalCards: number;
    onRestart: () => void;
    onBackToDashboard: () => void;
}

export function CompletionScreen({ masteredCards, missedCards, totalCards, onRestart, onBackToDashboard }: CompletionScreenProps) {
    const masteredCount = masteredCards.length;
    const accuracy = Math.round((masteredCount / totalCards) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full" />
                <div className="relative w-32 h-32 bg-surface border-2 border-brand-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                    <Trophy className="w-16 h-16 text-brand-primary" />
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-2 -right-2 bg-success text-white px-3 py-1 rounded-full text-sm font-semibold tabular-nums"
                >
                    {accuracy}%
                </motion.div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-foreground">Session complete</h2>
            <p className="text-foreground-secondary text-base sm:text-lg mb-10 max-w-md leading-relaxed px-2">
                Nice work — here&apos;s how this run shaped up.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
                <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-bold text-brand-primary mb-1 tabular-nums">{masteredCount}</span>
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide text-center">Mastered</span>
                </div>
                <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-bold text-error mb-1 tabular-nums">{missedCards.length}</span>
                    <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide text-center">Skipped / review</span>
                </div>
            </div>

            {missedCards.length > 0 && (
                <div className="w-full max-w-2xl bg-surface/50 border border-border rounded-2xl p-5 sm:p-6 mb-10 text-left">
                    <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-5 h-5 text-brand-primary shrink-0" />
                        <h3 className="text-sm font-semibold text-foreground">Cards to revisit</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {missedCards.slice(0, 6).map((card) => (
                            <div key={card.id} className="px-3 py-2 bg-surface rounded-xl border border-border text-xs font-medium truncate">
                                {card.term}
                            </div>
                        ))}
                        {missedCards.length > 6 && (
                            <div className="px-3 py-2 bg-surface rounded-xl border border-border text-xs font-bold text-foreground-muted">
                                +{missedCards.length - 6} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-2xl">
                <button
                    onClick={onRestart}
                    className="flex-1 w-full py-4 bg-surface border border-border rounded-xl font-semibold text-base hover:bg-surface-active transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5 text-foreground-muted" />
                    Study again
                </button>
                <button
                    onClick={onBackToDashboard}
                    className="flex-1 w-full py-4 bg-brand-primary text-black rounded-xl font-semibold text-base hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Finish <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
