import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';


interface FolderCardProps {
    folder: {
        id: number;
        name: string;
        color: string;
        createdAt: string;
    };
    decksCount: number;
    delay?: number;
    openDropdownId: string | number | null;
    setOpenDropdownId: (id: string | number | null) => void;
    handleOpenRenameFolder: (id: number) => void;
    handleDeleteFolder: (id: number) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
    folder,
    decksCount,
    delay = 0,
    openDropdownId,
    setOpenDropdownId,
    handleOpenRenameFolder,
    handleDeleteFolder,
}) => {
    const [isDeleteHolding, setIsDeleteHolding] = React.useState(false);

    React.useEffect(() => {
        let timer: any;
        if (isDeleteHolding) {
            timer = setTimeout(() => {
                handleDeleteFolder(folder.id);
                setIsDeleteHolding(false);
            }, 1000); // 1 second hold
        }
        return () => clearTimeout(timer);
    }, [isDeleteHolding, folder.id, handleDeleteFolder]);

    const isDropdownOpen = openDropdownId === folder.id;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className="relative h-[220px] w-full group cursor-pointer select-none"
        >
            {/* Back Panel (Tab Layer) - Darker shade */}
            <div className={`absolute inset-0 top-3 rounded-2xl ${folder.color} brightness-75 transition-all duration-300`} />

            {/* Tab Shape (Top Left) - Connected to Back Panel */}
            <div className={`absolute top-0 left-0 w-[40%] h-8 rounded-t-xl ${folder.color} brightness-75 transition-all duration-300`} />

            {/* Papers / Contents Layer */}
            <div className="absolute inset-x-6 top-5 bottom-4 z-10">
                {/* Paper 2 (Middle) */}
                <div className="absolute top-1 left-1 right-1 h-[80%] bg-white/60 dark:bg-white/10 rounded-lg transform -rotate-2 group-hover:-rotate-3 transition-transform duration-500 border border-white/20" />

                {/* Paper 1 (Front) */}
                <div className="absolute top-3 left-0 right-0 h-[80%] bg-white dark:bg-zinc-100 rounded-lg shadow-sm transform rotate-1 group-hover:rotate-0 transition-transform duration-500 group-hover:-translate-y-2 flex flex-col p-3">
                    {/* Fake text lines for paper effect */}
                    <div className="w-1/2 h-2 bg-zinc-200 dark:bg-zinc-300 rounded-full mb-2" />
                    <div className="w-3/4 h-2 bg-zinc-100 dark:bg-zinc-200 rounded-full mb-1" />
                    <div className="w-2/3 h-2 bg-zinc-100 dark:bg-zinc-200 rounded-full" />
                </div>
            </div>

            {/* Front Pocket Layer - Main Color */}
            <div className={`absolute bottom-0 inset-x-0 h-[65%] rounded-2xl ${folder.color} z-20 shadow-lg group-hover:shadow-xl transition-all duration-300 flex flex-col p-5`}>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 pr-2 drop-shadow-md">
                        {folder.name}
                    </h3>

                    {/* Menu Button */}
                    <div className="relative -mr-2 -mt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(isDropdownOpen ? null : folder.id);
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
                                    initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 text-left"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => handleOpenRenameFolder(folder.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors rounded-xl"
                                    >
                                        <Pencil className="w-4 h-4 text-zinc-500" />
                                        Rename
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
                                            {isDeleteHolding ? "Hold to confirm" : "Delete"}
                                        </div>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="text-white/90 font-medium text-sm drop-shadow-sm flex items-center gap-2">
                        {decksCount} {decksCount === 1 ? 'deck' : 'decks'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
