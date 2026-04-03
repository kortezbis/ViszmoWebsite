import { motion } from 'framer-motion';
import { Plus, Sparkles, Layers, ArrowRight, BookOpen } from 'lucide-react';

interface DashboardEmptyStateProps {
    onCreate: () => void;
}

export function DashboardEmptyState({ onCreate }: DashboardEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="group relative flex flex-col items-center justify-center min-h-[640px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4rem] p-12 text-center overflow-hidden shadow-2xl shadow-sky-500/5"
        >
            {/* Immersive Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/15 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/15 transition-colors duration-1000" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Icon Sculpture */}
            <div className="relative mb-12" onClick={onCreate}>
                <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-600 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"
                />

                <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-[3rem] flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 cursor-pointer">
                    <Layers className="w-14 h-14 text-sky-500" />

                    {/* Orbiting Elements */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            rotate: [12, 20, 12]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-6 -right-6 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-xl"
                    >
                        <Sparkles className="w-7 h-7 text-amber-400" />
                    </motion.div>

                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            rotate: [-6, -15, -6]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-4 -left-8 w-18 h-18 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-xl"
                    >
                        <BookOpen className="w-8 h-8 text-indigo-500" />
                    </motion.div>
                </div>
            </div>

            {/* Content Text */}
            <div className="max-w-xl mx-auto relative z-10 space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]"
                >
                    Begin your <br />
                    <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">mastery journey</span>.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                >
                    Scientific spaced-repetition meets gorgeous design. <br className="hidden md:block" />
                    Create your first deck and start learning efficiently.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-6"
                >
                    <button
                        onClick={onCreate}
                        className="group relative inline-flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Plus className="relative z-10 w-7 h-7 stroke-[3px]" />
                        <span className="relative z-10">Create First Deck</span>
                        <ArrowRight className="relative z-10 w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </button>
                </motion.div>

                {/* Trust/Feature Pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex flex-wrap justify-center items-center gap-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Recall</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Synthesis</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Spaced Review</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
