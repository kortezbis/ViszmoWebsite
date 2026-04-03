import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronDown, ChevronUp, BookOpen, Lightbulb, Activity, BrainCircuit } from 'lucide-react';
import { type LearnCard } from './types';
import { speakText } from './utils/textToSpeech';

interface TeachingCardProps {
    card: LearnCard;
    onNext: () => void;
    autoPlay: boolean;
}

export function TeachingCard({ card, onNext, autoPlay }: TeachingCardProps) {
    const [level, setLevel] = useState<'standard' | 'eli5' | 'detailed'>('standard');
    const content = card.teachingContent;

    if (!content) return (
        <div>Loading content...</div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-8 pb-20"
        >
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    Teaching Phase
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{card.term}</h1>
                <p className="text-xl md:text-2xl font-medium text-foreground-secondary italic">
                    "{content.headline}"
                </p>
                <button
                    onClick={() => speakText(`${card.term}. ${content.headline}. ${content.eli5}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground-secondary transition-all"
                >
                    <Volume2 className="w-5 h-5" />
                    Read Aloud
                </button>
            </div>

            {/* Core Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. ELI5 / Main Explanation */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-brand-primary/5 to-transparent border border-brand-primary/20 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400 fill-current" />
                                Understanding the Concept
                            </h3>
                            <div className="flex bg-surface rounded-lg p-1 border border-border">
                                <button
                                    onClick={() => setLevel('eli5')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${level === 'eli5' ? 'bg-brand-primary text-white' : 'text-foreground-secondary'}`}
                                >
                                    ELI5
                                </button>
                                <button
                                    onClick={() => setLevel('standard')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${level === 'standard' ? 'bg-brand-primary text-white' : 'text-foreground-secondary'}`}
                                >
                                    Standard
                                </button>
                                <button
                                    onClick={() => setLevel('detailed')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${level === 'detailed' ? 'bg-brand-primary text-white' : 'text-foreground-secondary'}`}
                                >
                                    Deep Dive
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={level}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-lg leading-relaxed text-foreground"
                            >
                                {level === 'eli5' ? content.eli5 :
                                    level === 'detailed' ? content.detailed :
                                        card.definition}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. Key Terms Breakdown */}
                <div className="bg-surface border border-border rounded-3xl p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground-muted mb-4">Key Terminology</h3>
                    <ul className="space-y-4">
                        {content.keyTerms.map((kt, i) => (
                            <li key={i} className="flex flex-col">
                                <span className="font-bold text-brand-primary">{kt.term}</span>
                                <span className="text-sm text-foreground-secondary">{kt.definition}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Real World Application */}
                <div className="bg-surface border border-border rounded-3xl p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground-muted mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Real World Use
                    </h3>
                    <ul className="space-y-3">
                        {content.realWorldExamples.map((ex, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                                {ex}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Why It Matters Footer */}
            <div className="bg-surface-active/50 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                    <h4 className="font-bold mb-1">Why this matters</h4>
                    <p className="text-sm text-foreground-secondary">{content.importance}</p>
                </div>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    Start Challenge
                </button>
            </div>
        </motion.div>
    );
}
