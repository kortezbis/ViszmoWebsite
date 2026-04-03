import { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, color: string) => void;
}

const COLORS = [
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Rose', class: 'bg-rose-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Slate', class: 'bg-slate-500' },
];

export function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].class);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), selectedColor);
            setName('');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative z-10 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">New Folder</h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Folder Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.class}
                                            type="button"
                                            onClick={() => setSelectedColor(color.class)}
                                            className={`w-8 h-8 rounded-full transition-all ${color.class} ${selectedColor === color.class
                                                ? 'ring-2 ring-offset-2 ring-brand-primary dark:ring-offset-[#18181b] scale-110'
                                                : 'hover:scale-110'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Create Folder
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
