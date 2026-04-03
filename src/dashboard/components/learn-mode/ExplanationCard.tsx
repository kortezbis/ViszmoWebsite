import { motion } from 'framer-motion';
import { Lightbulb, Brain, MapPin, RefreshCw, ChevronRight } from 'lucide-react';
import { type LearnCard } from './types';

interface ExplanationCardProps {
    card: LearnCard;
    onRetry: () => void;
}

export function ExplanationCard({ card, onRetry }: ExplanationCardProps) {
    const { teachingContent: aiExplanation } = card;

    if (!aiExplanation) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl mx-auto flex flex-col gap-6"
        >
            <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="text-sm font-bold text-error uppercase tracking-widest">Not quite. Let's learn this together.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ELI5 */}
                <div className="bg-surface border border-border p-6 rounded-3xl hover:border-brand-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-2">ELI5 Explanation</h4>
                    <p className="text-sm text-foreground-secondary leading-relaxed">
                        {aiExplanation.eli5}
                    </p>
                </div>

                {/* Memory Trick (using importance as fallback) */}
                <div className="bg-surface border border-border p-6 rounded-3xl hover:border-brand-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-2">Why It Matters</h4>
                    <p className="text-sm text-foreground-secondary leading-relaxed">
                        {aiExplanation.importance}
                    </p>
                </div>

                {/* Real World */}
                <div className="bg-surface border border-border p-6 rounded-3xl hover:border-brand-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-2">Real World Example</h4>
                    <p className="text-sm text-foreground-secondary leading-relaxed font-italic">
                        {aiExplanation.realWorldExamples?.[0] || "No example provided."}
                    </p>
                </div>
            </div>

            <button
                onClick={onRetry}
                className="w-full py-6 bg-foreground text-background rounded-3xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
                <RefreshCw className="w-6 h-6" />
                Try Again
                <ChevronRight className="w-6 h-6 opacity-30" />
            </button>
        </motion.div>
    );
}
