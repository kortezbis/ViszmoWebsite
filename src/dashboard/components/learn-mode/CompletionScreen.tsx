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
                    className="absolute -top-2 -right-2 bg-success text-white px-3 py-1 rounded-full text-sm font-black"
                >
                    {accuracy}%
                </motion.div>
            </div>

            <h2 className="text-5xl font-black mb-4 tracking-tighter">Learn Mode Complete!</h2>
            <p className="text-foreground-secondary text-xl mb-12 max-w-md">
                You've successfully completed all three rounds of intensive study.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                <div className="bg-surface p-8 rounded-3xl border border-border flex flex-col items-center">
                    <span className="text-4xl font-black text-brand-primary mb-2">{masteredCount}</span>
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest">Concepts Mastered</span>
                </div>
                <div className="bg-surface p-8 rounded-3xl border border-border flex flex-col items-center">
                    <span className="text-4xl font-black text-error mb-2">{missedCards.length}</span>
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-widest">Still Learning</span>
                </div>
            </div>

            {missedCards.length > 0 && (
                <div className="w-full max-w-2xl bg-surface/50 border border-border rounded-3xl p-6 mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <BrainCircuit className="w-5 h-5 text-brand-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Cards for Review Tomorrow</h3>
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

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
                <button
                    onClick={onRestart}
                    className="flex-1 w-full py-5 bg-surface border border-border rounded-2xl font-black text-lg hover:bg-surface-active transition-all flex items-center justify-center gap-3"
                >
                    <RotateCcw className="w-5 h-5 text-foreground-muted" />
                    Restart Session
                </button>
                <button
                    onClick={onBackToDashboard}
                    className="flex-1 w-full py-5 bg-brand-primary text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,255,136,0.3)]"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Finish <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
