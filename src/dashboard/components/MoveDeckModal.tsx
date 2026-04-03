import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, FolderPlus, Check, ChevronRight } from 'lucide-react';
import type { Folder as FolderType } from '../contexts/DecksContext';

interface MoveDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckName: string;
    folders: FolderType[];
    currentFolderId?: number | null;
    onMove: (folderId: number | null) => void;
    onCreateFolder?: () => void;
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
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(currentFolderId ?? null);

    const handleMove = () => {
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
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Move to Folder</h2>
                                <p className="text-sm text-foreground-secondary mt-1 line-clamp-1">
                                    {deckName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {/* No Folder Option */}
                            <button
                                onClick={() => setSelectedFolderId(null)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-2 ${selectedFolderId === null
                                        ? 'bg-brand-primary/10 border-2 border-brand-primary'
                                        : 'bg-background-elevated border-2 border-transparent hover:border-border'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedFolderId === null ? 'bg-brand-primary/20' : 'bg-surface'
                                    }`}>
                                    <ChevronRight className={`w-6 h-6 ${selectedFolderId === null ? 'text-brand-primary' : 'text-foreground-muted'
                                        }`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <span className={`font-bold ${selectedFolderId === null ? 'text-brand-primary' : 'text-foreground'
                                        }`}>
                                        No Folder
                                    </span>
                                    <p className="text-xs text-foreground-secondary">
                                        Remove from folder (root level)
                                    </p>
                                </div>
                                {selectedFolderId === null && (
                                    <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>

                            {/* Folder Options */}
                            {folders.length > 0 ? (
                                <div className="space-y-2">
                                    {folders.map((folder) => (
                                        <button
                                            key={folder.id}
                                            onClick={() => setSelectedFolderId(folder.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedFolderId === folder.id
                                                    ? 'bg-brand-primary/10 border-2 border-brand-primary'
                                                    : 'bg-background-elevated border-2 border-transparent hover:border-border'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${folder.color} bg-opacity-20 flex items-center justify-center`}>
                                                <Folder className={`w-6 h-6 ${folder.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className={`font-bold ${selectedFolderId === folder.id ? 'text-brand-primary' : 'text-foreground'
                                                    }`}>
                                                    {folder.name}
                                                </span>
                                            </div>
                                            {selectedFolderId === folder.id && (
                                                <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            {currentFolderId === folder.id && selectedFolderId !== folder.id && (
                                                <span className="text-xs text-foreground-muted font-medium px-2 py-1 bg-surface rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto bg-surface-active rounded-full flex items-center justify-center mb-4">
                                        <Folder className="w-8 h-8 text-foreground-muted" />
                                    </div>
                                    <p className="text-foreground-secondary mb-4">No folders yet</p>
                                    {onCreateFolder && (
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onCreateFolder();
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary font-bold rounded-xl hover:bg-brand-primary/20 transition-colors"
                                        >
                                            <FolderPlus className="w-4 h-4" />
                                            Create Folder
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-border">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-surface-hover text-foreground font-bold rounded-xl hover:bg-surface-active transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMove}
                                disabled={selectedFolderId === currentFolderId}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Move
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
