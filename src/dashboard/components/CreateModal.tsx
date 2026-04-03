import { useRef, useEffect, useState } from 'react';
import {
    X,
    Upload,
    PenLine,
    Sparkles,
    FileText,
    ClipboardPaste,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../contexts/DecksContext';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
    const navigate = useNavigate();
    const { createDeck, setActiveDeck } = useDecks();
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'generate' | 'import' | 'manual'>('generate');
    const [pasteContent, setPasteContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleCreateFromScratch = () => {
        const newDeckId = createDeck('Untitled Deck');
        setActiveDeck(newDeckId);
        onClose();
        navigate(`/edit-deck/${newDeckId}`);
    };

    const handleGenerateFromText = async () => {
        if (!pasteContent.trim()) return;
        setIsGenerating(true);

        // TODO: Integrate with AI to generate flashcards from pasted text
        // For now, create a deck and navigate to edit
        setTimeout(() => {
            const newDeckId = createDeck('Generated Deck');
            setActiveDeck(newDeckId);
            setIsGenerating(false);
            onClose();
            navigate(`/edit-deck/${newDeckId}`);
        }, 1500);
    };

    const createOptions = [
        {
            id: 'generate',
            icon: Sparkles,
            title: 'Generate with AI',
            description: 'Paste your notes, text, or content and AI will create flashcards for you.',
            color: 'brand-primary',
            badge: 'Recommended'
        },
        {
            id: 'import',
            icon: Upload,
            title: 'Import File',
            description: 'Upload a PDF, PowerPoint, Word doc, or audio/video file.',
            color: 'brand-secondary',
            badge: 'Pro'
        },
        {
            id: 'manual',
            icon: PenLine,
            title: 'Create Manually',
            description: 'Write your own flashcards from scratch.',
            color: 'emerald-500',
            badge: null
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-background-elevated rounded-2xl border border-border shadow-2xl overflow-hidden relative z-10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Create Flashcards</h2>
                                <p className="text-sm text-foreground-muted mt-1">Choose how you want to create your study set</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {createOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            if (option.id === 'manual') {
                                                handleCreateFromScratch();
                                            } else {
                                                setActiveTab(option.id as any);
                                            }
                                        }}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${activeTab === option.id
                                                ? 'border-brand-primary bg-brand-primary/5'
                                                : 'border-border hover:border-brand-primary/50 bg-surface'
                                            }`}
                                    >
                                        {option.badge && (
                                            <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${option.badge === 'Recommended'
                                                    ? 'bg-brand-primary/20 text-brand-primary'
                                                    : 'bg-brand-secondary/20 text-brand-secondary'
                                                }`}>
                                                {option.badge}
                                            </span>
                                        )}
                                        <div className={`w-10 h-10 rounded-lg bg-${option.color}/20 flex items-center justify-center mb-3`}>
                                            <option.icon className={`w-5 h-5 text-${option.color}`} />
                                        </div>
                                        <h3 className="font-bold text-foreground text-sm mb-1">{option.title}</h3>
                                        <p className="text-xs text-foreground-muted leading-relaxed">
                                            {option.description}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* Generate with AI Content */}
                            {activeTab === 'generate' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <textarea
                                            value={pasteContent}
                                            onChange={(e) => setPasteContent(e.target.value)}
                                            placeholder="Paste your notes, lecture content, or any text here...&#10;&#10;AI will analyze the content and generate flashcards automatically."
                                            className="w-full h-48 p-4 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:border-brand-primary transition-colors"
                                        />
                                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-medium transition-colors">
                                                <ClipboardPaste className="w-3.5 h-3.5" />
                                                Paste
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleGenerateFromText}
                                            disabled={!pasteContent.trim() || isGenerating}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    Generate Flashcards
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-foreground-muted text-center">
                                        AI will extract key concepts and create term-definition pairs
                                    </p>
                                </motion.div>
                            )}

                            {/* Import File Content */}
                            {activeTab === 'import' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand-primary/50 transition-colors cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-brand-secondary/20 flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-6 h-6 text-brand-secondary" />
                                        </div>
                                        <p className="font-bold text-foreground mb-1">Drop your file here</p>
                                        <p className="text-sm text-foreground-muted mb-4">or click to browse</p>
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-surface rounded-md text-xs text-foreground-muted">PDF</span>
                                            <span className="px-2 py-1 bg-surface rounded-md text-xs text-foreground-muted">PPTX</span>
                                            <span className="px-2 py-1 bg-surface rounded-md text-xs text-foreground-muted">DOCX</span>
                                            <span className="px-2 py-1 bg-surface rounded-md text-xs text-foreground-muted">MP3</span>
                                            <span className="px-2 py-1 bg-surface rounded-md text-xs text-foreground-muted">MP4</span>
                                        </div>
                                    </div>

                                    {/* Alternative Import Options */}
                                    <div className="flex gap-3">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground font-medium transition-colors">
                                            <FileText className="w-4 h-4" />
                                            Import from Quizlet
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground font-medium transition-colors">
                                            <ClipboardPaste className="w-4 h-4" />
                                            Paste List
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick Actions Footer */}
                        <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
                            <p className="text-xs text-foreground-muted">
                                Need help? Check out our <button className="text-brand-primary hover:underline">quick start guide</button>
                            </p>
                            <button
                                onClick={handleCreateFromScratch}
                                className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                            >
                                Skip to manual editor
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
