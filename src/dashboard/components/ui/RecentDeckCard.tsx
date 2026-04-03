import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface RecentDeckCardProps {
    deck: {
        id: string;
        title: string;
        color: string;
        cards: any[];
        lastStudied?: string;
    };
    stats: {
        averageMastery: number;
    };
    delay?: number;
    handleDeckClick: (id: string) => void;
    formatLastStudied: (lastStudied?: string) => string;
}

export const RecentDeckCard: React.FC<RecentDeckCardProps> = ({
    deck,
    stats,
    delay = 0,
    handleDeckClick,
    formatLastStudied,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className="relative h-[220px] w-full group cursor-pointer"
            onClick={() => handleDeckClick(deck.id)}
        >
            {/* Flashcards / Papers Layer (Sticking out) */}
            {/* Card 3 (Furthest back) */}
            <div className="absolute top-4 left-8 right-8 h-32 bg-white/40 dark:bg-zinc-700/40 rounded-xl shadow-sm transform transition-all duration-500 ease-out group-hover:-translate-y-4 group-hover:rotate-[-3deg] z-0" />
            {/* Card 2 */}
            <div className="absolute top-5 left-6 right-6 h-36 bg-white/60 dark:bg-zinc-600/60 rounded-xl shadow-sm transform transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:rotate-[2deg] z-10" />
            {/* Card 1 (Main visible one behind pocket) */}
            <div className="absolute top-6 left-5 right-5 h-40 bg-white dark:bg-zinc-100 rounded-xl shadow-sm transform transition-all duration-300 ease-out group-hover:-translate-y-2 z-10 border border-black/5 flex flex-col items-center pt-4" >
                {/* Lines to simulate text */}
                <div className="w-3/4 h-2 bg-zinc-100 dark:bg-zinc-300 rounded-full mb-2" />
                <div className="w-1/2 h-2 bg-zinc-100 dark:bg-zinc-300 rounded-full" />
            </div>

            {/* Front Pocket Layer */}
            <div className={`absolute bottom-0 inset-x-0 h-[65%] rounded-3xl ${deck.color} z-20 shadow-lg transition-all duration-300 group-hover:shadow-xl flex flex-col p-6 overflow-hidden`}>
                {/* Glass-ish Overlay for texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none" />

                <div className="relative z-30 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 pr-2 drop-shadow-md">
                            {deck.title}
                        </h3>

                        {/* Play Icon (Visible on hover) */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            animate={{ scale: 1, opacity: 1 }} // Always slightly visible or hover only? Let's make it prominent on hover
                            className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm group-hover:bg-white group-hover:text-brand-primary transition-colors duration-300"
                        >
                            <Play className="w-4 h-4 fill-current" />
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 text-white border border-white/10">
                            <span className="text-xs font-medium">
                                {formatLastStudied(deck.lastStudied)}
                            </span>
                        </div>

                        <div className="text-xs font-medium text-white/80">
                            {stats.averageMastery}% Mastered
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
