import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Pencil, Link as LinkIcon, Copy, FolderPlus, Trash2 } from 'lucide-react';
import { getDeckCardCount } from '../../contexts/DecksContext';

interface LiquidDeckCardProps {
    deck: {
        id: string;
        title: string;
        color: string;
        cards: any[];
        cardCount?: number;
        lastStudied?: string;
    };
    stats: {
        averageMastery: number;
    };
    delay?: number;
    openDropdownId: string | number | null;
    setOpenDropdownId: (id: string | number | null) => void;
    handleDeckClick: (id: string) => void;
    handleEditDeck: (e: React.MouseEvent, id: string) => void;
    handleShareDeck: (id: string) => void;
    handleOpenRenameDeck: (id: string) => void;
    handleDuplicateDeck: (id: string) => void;
    handleOpenMoveModal: (id: string) => void;
    handleDeleteDeck: (id: string) => void;
    formatLastStudied: (lastStudied?: string) => string;
}

export const LiquidDeckCard: React.FC<LiquidDeckCardProps> = ({
    deck,
    stats,
    delay = 0,
    openDropdownId,
    setOpenDropdownId,
    handleDeckClick,
    handleEditDeck,
    handleShareDeck,
    handleOpenRenameDeck,
    handleDuplicateDeck,
    handleOpenMoveModal,
    handleDeleteDeck,
}) => {
    const nCards = getDeckCardCount({ cards: deck.cards, cardCount: deck.cardCount });
    const isDropdownOpen = openDropdownId === deck.id;

    const [isDeleteHolding, setIsDeleteHolding] = React.useState(false);

    React.useEffect(() => {
        let timer: any;
        if (isDeleteHolding) {
            timer = setTimeout(() => {
                handleDeleteDeck(deck.id);
                setIsDeleteHolding(false);
            }, 1000); // 1 second hold
        }
        return () => clearTimeout(timer);
    }, [isDeleteHolding, deck.id, handleDeleteDeck]);

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
            <div className={`absolute bottom-0 inset-x-0 h-[65%] rounded-3xl ${deck.color} z-20 shadow-lg transition-all duration-300 group-hover:shadow-xl flex flex-col p-6 overflow-visible`}>
                {/* Glass-ish Overlay for texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none" />

                <div className="relative z-30 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 pr-6 drop-shadow-md">
                            {deck.title}
                        </h3>

                        {/* More Menu */}
                        <div className="relative -mt-1 -mr-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(isDropdownOpen ? null : deck.id);
                                }}
                                className={`text-white/80 hover:text-white p-2 hover:bg-black/10 rounded-full transition-colors ${isDropdownOpen ? 'bg-black/10 text-white' : ''}`}
                            >
                                <motion.div
                                    animate={{ rotate: isDropdownOpen ? 90 : 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: 20, y: -20 }}
                                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: 20, y: -20 }}
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden origin-top-right p-1.5 text-left"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button onClick={(e) => handleEditDeck(e, deck.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                            <Pencil className="w-4 h-4 text-zinc-500" /> Edit Cards
                                        </button>
                                        <button onClick={() => handleShareDeck(deck.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                            <LinkIcon className="w-4 h-4 text-zinc-500" /> Share Deck
                                        </button>
                                        <button onClick={() => handleOpenRenameDeck(deck.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                            <Pencil className="w-4 h-4 text-zinc-500" /> Rename
                                        </button>
                                        <button onClick={() => handleDuplicateDeck(deck.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                            <Copy className="w-4 h-4 text-zinc-500" /> Duplicate
                                        </button>
                                        <button onClick={() => handleOpenMoveModal(deck.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl">
                                            <FolderPlus className="w-4 h-4 text-zinc-500" /> Move to Workspace
                                        </button>
                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1"></div>
                                        <motion.button
                                            className="relative w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 rounded-xl bg-transparent overflow-hidden"
                                            onMouseDown={() => setIsDeleteHolding(true)}
                                            onMouseUp={() => setIsDeleteHolding(false)}
                                            onMouseLeave={() => setIsDeleteHolding(false)}
                                            onTouchStart={() => setIsDeleteHolding(true)}
                                            onTouchEnd={() => setIsDeleteHolding(false)}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-red-100 dark:bg-red-900/40 z-0"
                                                initial={{ width: "0%" }}
                                                animate={{ width: isDeleteHolding ? "100%" : "0%" }}
                                                transition={{ duration: isDeleteHolding ? 1 : 0.2, ease: "linear" }}
                                            />
                                            <div className="relative z-10 flex items-center gap-2.5">
                                                <Trash2 className="w-4 h-4" />
                                                {isDeleteHolding ? "Hold to confirm" : "Delete Deck"}
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center pt-4 border-t border-white/10 mt-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 text-white border border-white/10">
                            <span className="text-xs font-medium">
                                {nCards} {nCards === 1 ? 'Card' : 'Cards'}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span className="text-xs font-medium">
                                {stats.averageMastery}% Mastery
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
