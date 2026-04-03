import { motion } from 'framer-motion';
import { Volume2, ChevronRight, Zap } from 'lucide-react';
import { readAloud } from './utils/textToSpeech';
import { type LearnCard } from './types';
import { useEffect, useState } from 'react';

interface IntroCardProps {
    card: LearnCard;
    onContinue: () => void;
    autoPlay: boolean;
}

export function IntroCard({ card, onContinue, autoPlay }: IntroCardProps) {
    const [canContinue, setCanContinue] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        if (autoPlay) {
            readAloud(`${card.term}. ${card.definition}`);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanContinue(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [card, autoPlay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl mx-auto p-8 bg-surface rounded-3xl border border-border shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted">Study Concept</span>
            </div>

            <div className="text-center space-y-8 mb-12">
                <h2 className="text-5xl font-black tracking-tighter text-foreground selection:bg-brand-primary/30">
                    {card.term}
                </h2>

                <div className="relative group">
                    <p className="text-2xl font-medium text-foreground-secondary leading-relaxed selection:bg-brand-primary/30">
                        {card.definition}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button
                    onClick={() => readAloud(`${card.term}. ${card.definition}`)}
                    className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-widest"
                >
                    <Volume2 className="w-4 h-4" />
                    Read Aloud
                </button>

                <div className="w-full h-px bg-border/50" />

                <button
                    onClick={onContinue}
                    disabled={!canContinue}
                    className={`
                        w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 flex items-center justify-center gap-3
                        ${canContinue
                            ? 'bg-brand-primary text-black hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,255,136,0.3)] active:scale-[0.98]'
                            : 'bg-surface-active text-foreground-muted cursor-not-allowed opacity-50'}
                    `}
                >
                    {!canContinue ? `Reviewing (${timeLeft}s)` : 'Got it, let\'s quiz!'}
                    <ChevronRight className="w-6 h-6" />
                </button>
                <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Press Space to continue</p>
            </div>
        </motion.div>
    );
}
