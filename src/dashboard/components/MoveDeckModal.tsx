import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Plus, Check } from 'lucide-react';
import { useState } from 'react';

interface MoveDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckName: string;
    folders: Array<{
        id: number;
        name: string;
        color: string;
    }>;
    currentFolderId: number | null;
    onMove: (folderId: number | null) => void;
    onCreateFolder: () => void;
}

export function MoveDeckModal({
    isOpen,
    onClose,
    deckName,
    folders,
    currentFolderId,
    onMove,
    onCreateFolder
}: MoveDeckModalProps) {
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(currentFolderId);

    const handleConfirmMove = () => {
        onMove(selectedFolderId);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                    <Folder className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Move Deck</h2>
                                    <p className="text-xs text-foreground-secondary truncate max-w-[200px]">
                                        Moving "{deckName}"
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[400px] overflow-y-auto">
                            <div className="space-y-2">
                                {/* Root Option */}
                                <button
                                    onClick={() => setSelectedFolderId(null)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        selectedFolderId === null
                                            ? 'bg-brand-primary/5 border-brand-primary'
                                            : 'bg-background border-border hover:border-brand-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                                            <Folder className="w-5 h-5 text-foreground-muted" />
                                        </div>
                                        <span className="font-bold text-foreground">Library (Root)</span>
                                    </div>
                                    {selectedFolderId === null && (
                                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>

                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                            selectedFolderId === folder.id
                                                ? 'bg-brand-primary/5 border-brand-primary'
                                                : 'bg-background border-border hover:border-brand-primary/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${folder.color}20` }}
                                            >
                                                <Folder className="w-5 h-5" style={{ color: folder.color }} />
                                            </div>
                                            <span className="font-bold text-foreground truncate max-w-[180px]">
                                                {folder.name}
                                            </span>
                                        </div>
                                        {selectedFolderId === folder.id && (
                                            <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}

                                {/* Create Folder Button in list */}
                                <button
                                    onClick={() => {
                                        onClose();
                                        onCreateFolder();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-border hover:border-brand-primary hover:bg-surface-hover/50 group transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-foreground-secondary group-hover:text-brand-primary">
                                        Create New Folder
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border flex gap-3 bg-surface">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-surface-hover text-foreground font-bold rounded-xl hover:bg-surface-active transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmMove}
                                disabled={selectedFolderId === currentFolderId}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-brand-primary/25"
                            >
                                Move Here
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
