import { useRef, useEffect, useState, useCallback } from 'react';
import {
    X,
    PenLine,
    Sparkles,
    FileText,
    ClipboardPaste,
    ArrowRight,
    Loader2,
    Mic,
    FileUp,
    Upload,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../contexts/DecksContext';
import { generateFlashcardsFromText } from '../../services/flashcardGenerator';
import { supabase } from '../../lib/supabase';
import { generateFlashcardsFromFile } from '../../services/flashcardGenerator';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'choose' | 'generate' | 'import';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
    const navigate = useNavigate();
    const { createDeck, setActiveDeck } = useDecks();
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [step, setStep] = useState<Step>('choose');
    const [pasteContent, setPasteContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const resetState = useCallback(() => {
        setStep('choose');
        setPasteContent('');
        setIsGenerating(false);
        setGenError(null);
        setUploadStatus('idle');
        setUploadError(null);
        setDragOver(false);
        abortRef.current?.abort();
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [onClose, resetState]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClose]);

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') handleClose();
        }
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleClose]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) resetState();
    }, [isOpen, resetState]);

    // ── Write Manually ──────────────────────────────────────────────────────────
    const handleCreateFromScratch = () => {
        void (async () => {
            const newDeckId = await createDeck('Untitled Deck');
            setActiveDeck(newDeckId);
            handleClose();
            navigate(`/dashboard/edit-deck/${newDeckId}`);
        })();
    };

    // ── Paste Notes → AI Generate ───────────────────────────────────────────────
    const handleGenerateFromText = async () => {
        const text = pasteContent.trim();
        if (!text) return;
        setIsGenerating(true);
        setGenError(null);
        abortRef.current = new AbortController();
        try {
            const cards = await generateFlashcardsFromText(text, abortRef.current.signal);
            if (!cards.length) throw new Error('AI returned no cards. Try adding more text.');
            const newDeckId = await createDeck('AI Generated Deck', undefined, cards);
            setActiveDeck(newDeckId);
            handleClose();
            navigate(`/dashboard/deck/${newDeckId}`);
        } catch (e: unknown) {
            if ((e as Error)?.name === 'AbortError') return;
            setGenError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ── File Upload → AI Process ────────────────────────────────────────────────
    const handleFileSelected = async (file: File) => {
        setUploadStatus('uploading');
        setUploadError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sign in to upload files.');

            const ext = file.name.split('.').pop() ?? 'bin';
            const path = `${session.user.id}/${Date.now()}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from('uploads')
                .upload(path, file, { cacheControl: '3600', upsert: false });
            if (upErr) throw upErr;

            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
            setUploadStatus('processing');

            abortRef.current = new AbortController();
            const cards = await generateFlashcardsFromFile(publicUrl, file.type, abortRef.current.signal);
            if (!cards.length) throw new Error('AI could not extract cards from this file.');

            const newDeckId = await createDeck(file.name.replace(/\.[^.]+$/, ''), undefined, cards);
            setActiveDeck(newDeckId);
            setUploadStatus('done');
            setTimeout(() => {
                handleClose();
                navigate(`/dashboard/deck/${newDeckId}`);
            }, 800);
        } catch (e: unknown) {
            if ((e as Error)?.name === 'AbortError') return;
            setUploadStatus('error');
            setUploadError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) void handleFileSelected(file);
    };

    const handlePasteClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setPasteContent(text);
        } catch {
            // browser may block clipboard read; user can paste manually
        }
    };

    // ── Create options ──────────────────────────────────────────────────────────
    const createOptions = [
        {
            id: 'record',
            icon: Mic,
            title: 'Record Lecture',
            description: 'Record audio live and AI will transcribe and generate cards.',
            colorClass: 'text-rose-500',
            badge: 'Mobile',
            action: () => { navigate('/dashboard/decks?tab=lectures'); handleClose(); },
        },
        {
            id: 'import',
            icon: FileUp,
            title: 'Upload Content',
            description: 'Upload PDFs, PowerPoints, or audio/video files.',
            colorClass: 'text-brand-primary',
            badge: null,
            action: () => setStep('import'),
        },
        {
            id: 'generate',
            icon: Sparkles,
            title: 'Paste Notes',
            description: 'Paste text and AI will generate flashcards instantly.',
            colorClass: 'text-brand-secondary',
            badge: 'Recommended',
            action: () => setStep('generate'),
        },
        {
            id: 'manual',
            icon: PenLine,
            title: 'Write Manually',
            description: 'Create cards yourself from scratch.',
            colorClass: 'text-emerald-500',
            badge: null,
            action: handleCreateFromScratch,
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
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
                            <div className="flex items-center gap-3">
                                {step !== 'choose' && (
                                    <button
                                        onClick={() => setStep('choose')}
                                        className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {step === 'choose' && 'Create Flashcards'}
                                        {step === 'generate' && 'Paste Notes'}
                                        {step === 'import' && 'Upload Content'}
                                    </h2>
                                    <p className="text-sm text-foreground-muted mt-0.5">
                                        {step === 'choose' && 'Choose how to create your study set'}
                                        {step === 'generate' && 'AI will extract key concepts automatically'}
                                        {step === 'import' && 'AI processes your file and generates cards'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* ── Step: Choose ─────────────────────────────────────── */}
                            <AnimatePresence mode="wait">
                                {step === 'choose' && (
                                    <motion.div
                                        key="choose"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {createOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={option.action}
                                                className="relative p-5 rounded-2xl border-2 border-border hover:border-brand-primary/40 bg-surface/50 hover:bg-surface text-left transition-all group"
                                            >
                                                {option.badge && (
                                                    <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-primary/15 text-brand-primary">
                                                        {option.badge}
                                                    </span>
                                                )}
                                                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 shadow-sm border border-border/50 group-hover:scale-105 transition-transform">
                                                    <option.icon className={`w-6 h-6 ${option.colorClass}`} />
                                                </div>
                                                <h3 className="font-bold text-foreground text-base mb-1">{option.title}</h3>
                                                <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">
                                                    {option.description}
                                                </p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {/* ── Step: Paste Notes / AI Generate ───────────────── */}
                                {step === 'generate' && (
                                    <motion.div
                                        key="generate"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative">
                                            <textarea
                                                value={pasteContent}
                                                onChange={(e) => setPasteContent(e.target.value)}
                                                placeholder={"Paste your notes, lecture content, or any text here...\n\nAI will analyze the content and generate flashcards automatically."}
                                                className="w-full h-52 p-4 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => void handlePasteClipboard()}
                                                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-medium transition-colors"
                                            >
                                                <ClipboardPaste className="w-3.5 h-3.5" />
                                                Paste
                                            </button>
                                        </div>

                                        {genError && (
                                            <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                {genError}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => void handleGenerateFromText()}
                                            disabled={!pasteContent.trim() || isGenerating}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generating flashcards...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    Generate Flashcards
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-foreground-muted text-center">
                                            AI extracts key concepts and creates term–definition pairs
                                        </p>
                                    </motion.div>
                                )}

                                {/* ── Step: Upload File ─────────────────────────────── */}
                                {step === 'import' && (
                                    <motion.div
                                        key="import"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-4"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.mp3,.mp4,.m4a,.wav"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) void handleFileSelected(f);
                                            }}
                                        />

                                        {uploadStatus === 'idle' || uploadStatus === 'error' ? (
                                            <>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                                                        dragOver
                                                            ? 'border-brand-primary bg-brand-primary/5'
                                                            : 'border-border hover:border-brand-primary/50 hover:bg-surface'
                                                    }`}
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                                                        <Upload className="w-7 h-7 text-brand-primary" />
                                                    </div>
                                                    <p className="font-bold text-foreground mb-1">Drop your file here</p>
                                                    <p className="text-sm text-foreground-muted mb-5">or click to browse</p>
                                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                                        {['PDF', 'PPTX', 'DOCX', 'MP3', 'MP4', 'TXT'].map((t) => (
                                                            <span key={t} className="px-2.5 py-1 bg-surface rounded-lg text-xs font-medium text-foreground-muted border border-border">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {uploadError && (
                                                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                        {uploadError}
                                                    </div>
                                                )}

                                                <div className="flex gap-3">
                                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground font-medium transition-colors text-sm">
                                                        <FileText className="w-4 h-4" />
                                                        Import from Quizlet
                                                    </button>
                                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground font-medium transition-colors text-sm">
                                                        <ClipboardPaste className="w-4 h-4" />
                                                        Paste List
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                {uploadStatus === 'done' ? (
                                                    <>
                                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                                        <p className="font-bold text-foreground">Deck created!</p>
                                                        <p className="text-sm text-foreground-muted">Redirecting to your new deck…</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                                                        <p className="font-bold text-foreground">
                                                            {uploadStatus === 'uploading' ? 'Uploading file…' : 'AI is processing your file…'}
                                                        </p>
                                                        <p className="text-sm text-foreground-muted">This may take a moment</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {step === 'choose' && (
                            <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end">
                                <button
                                    onClick={handleCreateFromScratch}
                                    className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                                >
                                    Skip to manual editor
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
