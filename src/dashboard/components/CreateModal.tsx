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
    BookMarked,
    Podcast,
    Search,
    Plus,
    ChevronRight,
    Layers,
    BookOpen,
    Youtube,
    Link,
    GraduationCap,
    Import,
    LayoutGrid,
    Square,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../contexts/DecksContext';
import { generateFlashcardsFromText } from '../../services/flashcardGenerator';
import { supabase } from '../../lib/supabase';
import { generateFlashcardsFromFile } from '../../services/flashcardGenerator';
import GeneratePodcastForm from './GeneratePodcastForm';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialWorkspaceId?: string | null;
    initialStep?: Step;
}

type Step = 'type' | 'destination' | 'create-deck' | 'choose' | 'generate' | 'import' | 'youtube' | 'subject' | 'link' | 'quizlet' | 'csv' | 'podcast' | 'record';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const CREATE_OPTIONS = [
    {
        id: 'record',
        brandingImage: '/logos/branding/voice.png',
        title: 'Lecture Mode',
        subtitle: 'Record class and generate cards.',
        colorClass: 'text-rose-500',
        bgClass: 'bg-rose-500/10',
        action: 'record' as const,
    },
    {
        id: 'manual',
        brandingImage: '/logos/branding/manual.png.png',
        title: 'Manual',
        subtitle: 'Enter cards one by one manually.',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10',
        action: 'manual' as const,
    },
    {
        id: 'upload',
        brandingImage: '/logos/branding/upload.png.png',
        title: 'Upload / Photo',
        subtitle: 'Upload notes, PDFs, or files to generate.',
        colorClass: 'text-brand-primary',
        bgClass: 'bg-brand-primary/10',
        action: 'import' as const,
    },
    {
        id: 'paste',
        brandingImage: '/logos/branding/voice.png',
        title: 'Text / Paste',
        subtitle: 'Type out or paste your notes to generate.',
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-400/10',
        action: 'generate' as const,
    },
    {
        id: 'youtube',
        brandingImage: '/logos/branding/youtube.png.png',
        title: 'YouTube',
        subtitle: 'Enter a YouTube topic or URL to generate from.',
        colorClass: 'text-red-500',
        bgClass: 'bg-red-500/10',
        action: 'youtube' as const,
    },
    {
        id: 'subject',
        brandingImage: '/logos/branding/book.png.png',
        title: 'Subject / Topic',
        subtitle: 'Enter a topic and AI will build your set.',
        colorClass: 'text-orange-400',
        bgClass: 'bg-orange-500/10',
        action: 'subject' as const,
    },
    {
        id: 'link',
        brandingImage: '/logos/branding/link.png.png',
        title: 'Web Link',
        subtitle: 'Crawl a website link to build content.',
        colorClass: 'text-cyan-400',
        bgClass: 'bg-cyan-500/10',
        action: 'link' as const,
    },
    {
        id: 'quizlet',
        brandingImage: '/logos/branding/quizlet.png.png',
        title: 'Quizlet',
        subtitle: 'Import exactly from a Quizlet set.',
        colorClass: 'text-indigo-400',
        bgClass: 'bg-indigo-500/10',
        action: 'quizlet' as const,
    },
    {
        id: 'import-csv',
        brandingImage: '/logos/branding/binder.png',
        title: 'Import',
        subtitle: 'Import terms from CSV, TSV, or raw text.',
        colorClass: 'text-zinc-400',
        bgClass: 'bg-zinc-500/10',
        action: 'import-csv' as const,
    },
    {
        id: 'podcast',
        brandingImage: '/logos/branding/podcast.png',
        title: 'Generate Podcast',
        subtitle: 'Convert your notes into an AI podcast.',
        colorClass: 'text-rose-500',
        bgClass: 'bg-rose-500/10',
        action: 'podcast' as const,
    },
];

export function CreateModal({ isOpen, onClose, initialWorkspaceId, initialStep }: CreateModalProps) {
    const navigate = useNavigate();
    const { createDeck, setActiveDeck, workspaces, createWorkspace } = useDecks();
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const [step, setStep] = useState<Step>(initialStep || 'type');

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep || 'type');
        }
    }, [isOpen, initialStep]);

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(initialWorkspaceId || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckColor, setNewDeckColor] = useState('#3B82F6');
    const [pasteContent, setPasteContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const mainWorkspaces = workspaces.filter(w => !w.parentId);
    const subWorkspaces = workspaces.filter(w => w.parentId);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedWorkspaces(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            const matchingParents = mainWorkspaces.filter(ws =>
                subWorkspaces.some(child => child.parentId === ws.id && child.name.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map(ws => ws.id);

            if (matchingParents.length > 0) {
                setExpandedWorkspaces(prev => {
                    const next = new Set(prev);
                    matchingParents.forEach(id => next.add(id));
                    return next;
                });
            }
        }
    }, [searchQuery, mainWorkspaces, subWorkspaces]);

    const resetState = useCallback(() => {
        setStep(initialWorkspaceId ? 'choose' : 'type');
        setSelectedWorkspaceId(initialWorkspaceId || null);
        setSearchQuery('');
        setNewDeckName('');
        setNewDeckColor('#3B82F6');
        setPasteContent('');
        setIsGenerating(false);
        setGenError(null);
        setUploadStatus('idle');
        setUploadError(null);
        setDragOver(false);
        setExpandedWorkspaces(new Set());
        abortRef.current?.abort();
    }, [initialWorkspaceId]);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [onClose, resetState]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClose]);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') handleClose();
        }
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleClose]);

    useEffect(() => {
        if (isOpen) resetState();
    }, [isOpen, resetState]);

    const handleCreateNewWorkspace = async () => {
        if (!newDeckName.trim()) return;
        try {
            const id = await createWorkspace(newDeckName, newDeckColor);
            setSelectedWorkspaceId(id);
            setStep('type');
            setNewDeckName('');
        } catch (e) {
            console.error('Failed to create deck:', e);
        }
    };

    const filteredMainWorkspaces = mainWorkspaces.filter(ws => {
        const matchesMain = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChild = subWorkspaces.some(child =>
            child.parentId === ws.id && child.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesMain || matchesChild;
    });

    const handleCreateFromScratch = () => {
        void (async () => {
            const newDeckId = await createDeck('Untitled Deck', undefined, [], selectedWorkspaceId || undefined);
            setActiveDeck(newDeckId);
            handleClose();
            navigate(`/dashboard/edit-deck/${newDeckId}`);
        })();
    };

    const handleGenerateFromText = async () => {
        const text = pasteContent.trim();
        if (!text) return;
        setIsGenerating(true);
        setGenError(null);
        abortRef.current = new AbortController();
        try {
            const cards = await generateFlashcardsFromText(text, abortRef.current.signal);
            if (!cards.length) throw new Error('AI returned no cards. Try adding more text.');
            const newDeckId = await createDeck('AI Generated Deck', undefined, cards, selectedWorkspaceId || undefined);
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

    const handleFileSelected = async (file: File) => {
        setUploadStatus('uploading');
        setUploadError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sign in to upload files.');
            const ext = file.name.split('.').pop() ?? 'bin';
            const path = `${session.user.id}/${Date.now()}.${ext}`;
            const { error: upErr } = await supabase.storage.from('uploads').upload(path, file, { cacheControl: '3600', upsert: false });
            if (upErr) throw upErr;
            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
            setUploadStatus('processing');
            abortRef.current = new AbortController();
            const cards = await generateFlashcardsFromFile(publicUrl, file.type, abortRef.current.signal);
            if (!cards.length) throw new Error('AI could not extract cards from this file.');
            const newDeckId = await createDeck(file.name.replace(/\.[^.]+$/, ''), undefined, cards, selectedWorkspaceId || undefined);
            setActiveDeck(newDeckId);
            setUploadStatus('done');
            setTimeout(() => { handleClose(); navigate(`/dashboard/deck/${newDeckId}`); }, 800);
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
        } catch { /* ignore */ }
    };

    const handleOptionAction = (action: string) => {
        if (action === 'manual') { handleCreateFromScratch(); return; }
        if (action === 'import') { setStep('import'); return; }
        if (action === 'generate') { setStep('generate'); return; }
        if (action === 'youtube') { setStep('youtube'); setInputValue(''); return; }
        if (action === 'subject') { setStep('subject'); setInputValue(''); return; }
        if (action === 'link') { setStep('link'); setInputValue(''); return; }
        if (action === 'quizlet') { setStep('quizlet'); setInputValue(''); return; }
        if (action === 'import-csv') { setStep('csv'); return; }
        if (action === 'podcast') { setStep('podcast'); return; }
        if (action === 'record') { setStep('record'); return; }
    };

    const handleUnifiedGenerate = async (type: 'youtube' | 'subject' | 'link' | 'quizlet') => {
        const val = inputValue.trim();
        if (!val) return;
        setIsProcessing(true);
        setGenError(null);
        abortRef.current = new AbortController();
        try {
            let prompt = '';
            let title = 'AI Generated Deck';

            if (type === 'youtube') {
                prompt = `Generate a set of 15 high-quality flashcards from this YouTube content/topic: "${val}". Extract key terminology and definitions.`;
                title = `YouTube: ${val.length > 20 ? val.substring(0, 20) + '...' : val}`;
            } else if (type === 'subject') {
                prompt = `Build a comprehensive set of 20 flashcards about the following topic: "${val}". Include core concepts, definitions, and important facts.`;
                title = val;
            } else if (type === 'link') {
                prompt = `Analyze the content of this website link and generate 15 flashcards: "${val}". Focus on the main educational points.`;
                title = `Web: ${val.length > 20 ? val.substring(0, 20) + '...' : val}`;
            } else if (type === 'quizlet') {
                prompt = `Import and recreate the flashcards from this Quizlet set link: "${val}". Maintain the term and definition pairs accurately.`;
                title = 'Quizlet Import';
            }

            const cards = await generateCardsFromPrompt(prompt, undefined, abortRef.current.signal);
            if (!cards.length) throw new Error('AI returned no cards. Please try a different prompt or link.');

            const newDeckId = await createDeck(title, undefined, cards, selectedWorkspaceId || undefined);
            setActiveDeck(newDeckId);
            handleClose();
            navigate(`/dashboard/decks/${newDeckId}`);
        } catch (e: unknown) {
            if ((e as Error)?.name === 'AbortError') return;
            setGenError(e instanceof Error ? e.message : 'Generation failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                void handleAudioRecorded(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setGenError('Microphone access denied or not available.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleAudioRecorded = async (blob: Blob) => {
        setUploadStatus('uploading');
        setGenError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sign in to save recordings.');
            
            const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
            const path = `${session.user.id}/recordings/${file.name}`;
            
            const { error: upErr } = await supabase.storage.from('uploads').upload(path, file);
            if (upErr) throw upErr;
            
            const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
            
            setUploadStatus('processing');
            const cards = await generateFlashcardsFromFile(publicUrl, 'audio/webm', abortRef.current?.signal);
            
            if (cards.length > 0) {
                 const title = `Lecture ${new Date().toLocaleDateString()}`;
                 const newDeckId = await createDeck(title, undefined, cards, selectedWorkspaceId || undefined);
                 setActiveDeck(newDeckId);
                 setUploadStatus('done');
                 setTimeout(() => { handleClose(); navigate(`/dashboard/decks/${newDeckId}`); }, 800);
            } else {
                throw new Error("Could not extract content from recording. Try speaking longer or louder.");
            }
        } catch (e) {
            setUploadStatus('error');
            setGenError(e instanceof Error ? e.message : 'Failed to process recording.');
        }
    };

    const handleCsvImport = async (file: File) => {
        setIsProcessing(true);
        setGenError(null);
        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            const cards = lines.map(line => {
                // Try to detect separator
                const sep = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
                const [front, ...rest] = line.split(sep);
                return {
                    front: front?.trim() || '',
                    back: rest.join(sep).trim() || '',
                    starred: false
                };
            }).filter(c => c.front && c.back);

            if (!cards.length) throw new Error('No valid cards found in file. Use Comma or Tab separated values.');

            const newDeckId = await createDeck(file.name.replace(/\.[^.]+$/, ''), undefined, cards, selectedWorkspaceId || undefined);
            setActiveDeck(newDeckId);
            handleClose();
            navigate(`/dashboard/decks/${newDeckId}`);
        } catch (e) {
            setGenError(e instanceof Error ? e.message : 'Import failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const stepTitle = step === 'type' ? 'Create New'
        : step === 'destination' ? 'Select Deck'
            : step === 'create-deck' ? 'Create New Deck'
                : step === 'choose' ? 'Create'
                    : step === 'generate' ? 'Text / Paste'
                        : step === 'youtube' ? 'YouTube'
                            : step === 'subject' ? 'Subject / Topic'
                                : step === 'link' ? 'Web Link'
                                    : step === 'quizlet' ? 'Quizlet'
                                        : step === 'csv' ? 'Import CSV'
                                            : 'Upload / Photo';

    const stepSubtitle = step === 'type' ? 'Choose what you want to create'
        : step === 'destination' ? 'Choose where to organize your new set'
            : step === 'create-deck' ? 'Set up your workspace'
                : step === 'choose' ? 'Choose how you want to build your set.'
                    : step === 'generate' ? 'AI will extract key concepts automatically'
                        : step === 'youtube' ? 'AI extracts cards from video link or topic'
                            : step === 'subject' ? 'AI builds a set from any topic prompt'
                                : step === 'link' ? 'AI crawls a website to extract content'
                                    : step === 'quizlet' ? 'Import cards directly from a Quizlet URL'
                                        : step === 'csv' ? 'Upload an Anki or CSV/TSV file'
                                            : 'AI processes your file and generates cards';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="w-full sm:max-w-xl bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>

                        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-black/5 dark:border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                {step !== 'type' && (
                                    <button
                                        onClick={() => {
                                            if (step === 'destination') setStep('type');
                                            else if (step === 'create-deck') setStep('type');
                                            else if (step === 'choose') setStep('destination');
                                            else setStep('choose');
                                        }}
                                        className="p-1.5 rounded-xl hover:bg-surface-hover text-foreground-secondary hover:text-foreground transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{stepTitle}</h2>
                                    <p className="text-xs text-foreground-secondary mt-0.5">{stepSubtitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-hover text-foreground-secondary hover:text-foreground transition-all hover:scale-110 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[85vh] overflow-y-auto">
                            <AnimatePresence mode="wait">

                                {step === 'type' && (
                                    <motion.div key="type" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="p-5 space-y-6">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-1">Library</h4>
                                            <button
                                                onClick={() => setStep('create-deck')}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1.5">
                                                    <img src="/logos/branding/Deck.png" alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="block font-bold text-foreground text-sm">My Decks</span>
                                                </div>
                                                <ChevronRight size={16} className="text-foreground-muted shrink-0" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-1">Create & Study</h4>
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => setStep('destination')}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1.5">
                                                        <img src="/logos/branding/vocab.png" alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block font-bold text-foreground text-sm">Flashcard Set</span>
                                                        <span className="block text-xs text-foreground-secondary mt-0.5">Create or study terms</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-foreground-muted shrink-0" />
                                                </button>

                                                <button
                                                    onClick={() => setStep('record')}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1.5">
                                                        <img src="/logos/branding/voice.png" alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block font-bold text-foreground text-sm">Lecture Notes</span>
                                                        <span className="block text-xs text-foreground-secondary mt-0.5">Record or upload lectures</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-foreground-muted shrink-0" />
                                                </button>

                                                <button
                                                    onClick={() => { navigate('/dashboard/decks?tab=study-guides'); handleClose(); }}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1.5">
                                                        <img src="/logos/branding/guide.png" alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block font-bold text-foreground text-sm">Study Guide</span>
                                                        <span className="block text-xs text-foreground-secondary mt-0.5">AI-powered study guides</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-foreground-muted shrink-0" />
                                                </button>

                                                <button
                                                    onClick={() => setStep('podcast')}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1.5">
                                                        <img src="/logos/branding/podcast.png" alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block font-bold text-foreground text-sm">Generate Podcast</span>
                                                        <span className="block text-xs text-foreground-secondary mt-0.5">Convert notes to audio</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-foreground-muted shrink-0" />
                                                </button>

                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'destination' && (
                                    <motion.div key="destination" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="p-5 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search your decks..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl border border-black/5 dark:border-white/[0.05] focus:border-brand-primary outline-none text-sm transition-all"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] px-1 mb-3">Existing Decks</p>
                                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                                {filteredMainWorkspaces.length === 0 ? (
                                                    <p className="text-sm text-foreground-muted text-center py-6">No decks found{searchQuery && ` for "${searchQuery}"`}</p>
                                                ) : filteredMainWorkspaces.map(ws => {
                                                    const children = subWorkspaces.filter(child => child.parentId === ws.id);
                                                    const isExpanded = expandedWorkspaces.has(ws.id);

                                                    return (
                                                        <div key={ws.id} className="space-y-1">
                                                            <button
                                                                onClick={() => { setSelectedWorkspaceId(ws.id); setStep('choose'); }}
                                                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left"
                                                            >
                                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ws.color?.startsWith('bg-') ? '#3B82F6' : ws.color }} />
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="block font-bold text-foreground text-sm truncate">{ws.name}</span>
                                                                    <span className="block text-xs text-foreground-secondary mt-0.5">{ws.stats?.cardCount || 0} cards</span>
                                                                </div>

                                                                {children.length > 0 && (
                                                                    <div
                                                                        onClick={(e) => toggleExpand(ws.id, e)}
                                                                        className="p-1.5 hover:bg-surface rounded-lg text-foreground-muted transition-colors"
                                                                    >
                                                                        <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                                                    </div>
                                                                )}
                                                                {children.length === 0 && <ChevronRight size={16} className="text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />}
                                                            </button>

                                                            {isExpanded && children.length > 0 && (
                                                                <div className="pl-6 space-y-1 mt-1 border-l border-black/5 dark:border-white/5 ml-5">
                                                                    {children.map(child => (
                                                                        <button
                                                                            key={child.id}
                                                                            onClick={() => { setSelectedWorkspaceId(child.id); setStep('choose'); }}
                                                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 hover:bg-surface-hover border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all text-left"
                                                                        >
                                                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: child.color?.startsWith('bg-') ? '#3B82F6' : child.color }} />
                                                                            <div className="flex-1 min-w-0">
                                                                                <span className="block font-medium text-foreground text-sm truncate">{child.name}</span>
                                                                                <span className="block text-[10px] text-foreground-secondary">{child.stats?.cardCount || 0} cards</span>
                                                                            </div>
                                                                            <ChevronRight size={14} className="text-foreground-muted" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'create-deck' && (
                                    <motion.div key="create-deck" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Deck Name</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="e.g. Biology 101"
                                                    value={newDeckName}
                                                    onChange={(e) => setNewDeckName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewWorkspace()}
                                                    className="w-full px-4 py-3 bg-surface-hover border border-black/5 dark:border-white/[0.05] rounded-2xl outline-none focus:border-brand-primary text-base font-bold transition-all"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">Color</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'].map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setNewDeckColor(color)}
                                                            className={`w-10 h-10 rounded-full transition-all relative flex items-center justify-center ${newDeckColor === color ? 'ring-2 ring-white ring-offset-2 dark:ring-offset-background scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            {newDeckColor === color && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                                        </button>
                                                    ))}
                                                    <div className="relative w-10 h-10 group/custom">
                                                        <input
                                                            type="color"
                                                            value={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'].includes(newDeckColor) ? '#ffffff' : newDeckColor}
                                                            onChange={(e) => setNewDeckColor(e.target.value)}
                                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                                        />
                                                        <div
                                                            className={`w-10 h-10 rounded-full border-2 border-dashed border-black/10 dark:border-white/10 flex items-center justify-center transition-all ${!['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'].includes(newDeckColor) ? 'border-none ring-2 ring-white ring-offset-2 dark:ring-offset-background scale-110 shadow-lg' : 'hover:bg-surface-hover'}`}
                                                            style={!['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'].includes(newDeckColor) ? { backgroundColor: newDeckColor } : {}}
                                                        >
                                                            <Plus size={18} className={!['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'].includes(newDeckColor) ? 'text-white' : 'text-foreground-secondary'} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    onClick={handleCreateNewWorkspace}
                                                    disabled={!newDeckName.trim()}
                                                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-base shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                                                >
                                                    Create
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'choose' && (
                                    <motion.div key="choose" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5">
                                        <div className="space-y-1.5 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
                                            {CREATE_OPTIONS.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionAction(option.action)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-hover/40 hover:bg-surface-hover border border-black/5 dark:border-white/[0.05] hover:border-brand-primary/30 transition-all group text-left shadow-sm"
                                                >
                                                    <div className={`w-11 h-11 rounded-2xl ${option.bgClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform p-2`}>
                                                        <img src={option.brandingImage} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-foreground text-sm">{option.title}</span>
                                                        </div>
                                                        <span className="block text-xs text-foreground-secondary mt-0.5 leading-relaxed">{option.subtitle}</span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'generate' && (
                                    <motion.div key="generate" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-4">
                                        <div className="relative">
                                            <textarea
                                                value={pasteContent}
                                                onChange={(e) => setPasteContent(e.target.value)}
                                                placeholder={"Paste your notes, lecture content, or any text here...\n\nAI will analyze the content and generate flashcards automatically."}
                                                className="w-full h-52 p-4 bg-surface-hover border border-black/5 dark:border-white/[0.05] rounded-2xl text-foreground placeholder-foreground-muted resize-none focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => void handlePasteClipboard()}
                                                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface text-foreground-muted hover:text-foreground text-xs font-medium transition-colors border border-black/5 dark:border-white/[0.05]"
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
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25"
                                        >
                                            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating flashcards...</> : <><Sparkles className="w-4 h-4" />Generate Flashcards</>}
                                        </button>
                                        <p className="text-xs text-foreground-muted text-center">AI extracts key concepts and creates term–definition pairs</p>
                                    </motion.div>
                                )}

                                {step === 'import' && (
                                    <motion.div key="import" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-4">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.mp3,.mp4,.m4a,.wav"
                                            className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileSelected(f); }}
                                        />
                                        {uploadStatus === 'idle' || uploadStatus === 'error' ? (
                                            <>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-black/5 dark:border-white/[0.05] hover:border-brand-primary/50 hover:bg-surface-hover'}`}
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                                                        <Upload className="w-7 h-7 text-brand-primary" />
                                                    </div>
                                                    <p className="font-bold text-foreground mb-1">Drop your file here</p>
                                                    <p className="text-sm text-foreground-muted mb-5">or click to browse</p>
                                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                                        {['PDF', 'PPTX', 'DOCX', 'MP3', 'MP4', 'TXT'].map((t) => (
                                                            <span key={t} className="px-2.5 py-1 bg-surface rounded-lg text-xs font-medium text-foreground-muted border border-black/5 dark:border-white/10">{t}</span>
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
                                                    <button onClick={() => setStep('quizlet')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-black/5 dark:border-white/10 bg-surface-hover hover:bg-surface text-foreground font-medium transition-colors text-sm">
                                                        <LayoutGrid className="w-4 h-4" />
                                                        Quizlet Import
                                                    </button>
                                                    <button onClick={() => setStep('generate')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-black/5 dark:border-white/10 bg-surface-hover hover:bg-surface text-foreground font-medium transition-colors text-sm">
                                                        <ClipboardPaste className="w-4 h-4" />
                                                        Paste List
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                {uploadStatus === 'done' ? (
                                                    <><CheckCircle2 className="w-12 h-12 text-emerald-500" /><p className="font-bold text-foreground">Deck created!</p><p className="text-sm text-foreground-muted">Redirecting to your new deck…</p></>
                                                ) : (
                                                    <><Loader2 className="w-12 h-12 text-brand-primary animate-spin" /><p className="font-bold text-foreground">{uploadStatus === 'uploading' ? 'Uploading file…' : 'AI is processing your file…'}</p><p className="text-sm text-foreground-muted">This may take a moment</p></>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {(step === 'youtube' || step === 'subject' || step === 'link' || step === 'quizlet') && (
                                    <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-4">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-2 border border-black/5 dark:border-white/[0.05]">
                                                {step === 'youtube' && <Youtube className="w-8 h-8 text-red-500" />}
                                                {step === 'subject' && <GraduationCap className="w-8 h-8 text-orange-400" />}
                                                {step === 'link' && <Link className="w-8 h-8 text-cyan-400" />}
                                                {step === 'quizlet' && <LayoutGrid className="w-8 h-8 text-indigo-400" />}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-1">
                                                    {step === 'youtube' ? 'YouTube URL or Topic' : step === 'subject' ? 'What topic should we build?' : step === 'link' ? 'Website URL' : 'Quizlet URL'}
                                                </label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder={step === 'youtube' ? "Paste link or e.g. Quantum Physics" : step === 'subject' ? "e.g. Photosynthesis vs Cellular Respiration" : step === 'link' ? "https://example.com/article" : "https://quizlet.com/..."}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUnifiedGenerate(step as any)}
                                                    className="w-full px-4 py-3 bg-surface-hover border border-black/5 dark:border-white/[0.05] rounded-2xl outline-none focus:border-brand-primary text-base font-bold transition-all"
                                                />
                                            </div>

                                            {genError && (
                                                <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    {genError}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => void handleUnifiedGenerate(step as any)}
                                                disabled={!inputValue.trim() || isProcessing}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25"
                                            >
                                                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><Sparkles className="w-4 h-4" />{step === 'quizlet' ? 'Import Set' : 'Generate Cards'}</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'csv' && (
                                    <motion.div key="csv" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-4">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.tsv,.txt"
                                            className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCsvImport(f); }}
                                        />
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) void handleCsvImport(f); }}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-black/5 dark:border-white/[0.05] hover:border-brand-primary/50 hover:bg-surface-hover'}`}
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-500/10 flex items-center justify-center mx-auto mb-4">
                                                <Import className="w-7 h-7 text-zinc-500" />
                                            </div>
                                            <p className="font-bold text-foreground mb-1">Drop CSV or TSV file</p>
                                            <p className="text-sm text-foreground-muted mb-5">Anki, Excel, or comma-separated text</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="px-2.5 py-1 bg-surface rounded-lg text-xs font-medium text-foreground-muted border border-black/5 dark:border-white/10">.CSV</span>
                                                <span className="px-2.5 py-1 bg-surface rounded-lg text-xs font-medium text-foreground-muted border border-black/5 dark:border-white/10">.TSV</span>
                                                <span className="px-2.5 py-1 bg-surface rounded-lg text-xs font-medium text-foreground-muted border border-black/5 dark:border-white/10">.TXT</span>
                                            </div>
                                        </div>
                                        {genError && (
                                            <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                {genError}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 'podcast' && (
                                    <motion.div
                                        key="podcast"
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        className="p-5"
                                    >
                                        <GeneratePodcastForm onClose={handleClose} workspaceId={selectedWorkspaceId || undefined} />
                                    </motion.div>
                                )}

                                {step === 'record' && (
                                    <motion.div key="record" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 space-y-6">
                                        <div className="flex flex-col items-center justify-center py-8 gap-6">
                                            {uploadStatus === 'idle' ? (
                                                <>
                                                    <div className="relative">
                                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/20' : 'bg-surface-hover border-2 border-dashed border-black/10 dark:border-white/10'}`}>
                                                            <Mic size={40} className={isRecording ? 'text-white' : 'text-foreground-muted'} />
                                                        </div>
                                                        {isRecording && (
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="absolute -inset-4 border-2 border-red-500 rounded-full"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="text-center space-y-2">
                                                        <h3 className="text-2xl font-black text-foreground">{isRecording ? formatTime(recordingTime) : 'Lecture Mode'}</h3>
                                                        <p className="text-sm text-foreground-secondary max-w-[240px] mx-auto">
                                                            {isRecording ? 'Viszmo is listening to your lecture and will generate study materials.' : 'Start recording and let Viszmo turn your class into notes and cards.'}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-4 w-full">
                                                        {!isRecording ? (
                                                            <button
                                                                onClick={() => void startRecording()}
                                                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]"
                                                            >
                                                                <Mic size={20} />
                                                                Start Recording
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={stopRecording}
                                                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-500/90 transition-all shadow-xl shadow-red-500/20 active:scale-[0.98]"
                                                            >
                                                                <Square size={20} fill="currentColor" />
                                                                Stop & Save
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 gap-4 w-full">
                                                    {uploadStatus === 'done' ? (
                                                        <>
                                                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                                            <div className="text-center">
                                                                <p className="font-bold text-lg text-foreground">Lecture Processed!</p>
                                                                <p className="text-sm text-foreground-muted">Opening your new flashcard set…</p>
                                                            </div>
                                                        </>
                                                    ) : uploadStatus === 'error' ? (
                                                        <>
                                                            <AlertCircle className="w-16 h-16 text-red-500" />
                                                            <div className="text-center">
                                                                <p className="font-bold text-lg text-foreground text-red-500">Processing failed</p>
                                                                <p className="text-sm text-foreground-muted mb-4">{genError}</p>
                                                                <button
                                                                    onClick={() => { setUploadStatus('idle'); setGenError(null); }}
                                                                    className="px-6 py-2 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
                                                                >
                                                                    Try Again
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="relative">
                                                                <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-bold text-lg text-foreground">{uploadStatus === 'uploading' ? 'Uploading recording…' : 'AI is analyzing lecture…'}</p>
                                                                <p className="text-sm text-foreground-muted">This may take up to a minute for long recordings</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
