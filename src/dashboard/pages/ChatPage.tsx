import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Send,
    Plus,
    Sparkles,
    Loader2,
    ArrowLeft,
    MessageCircle,
} from 'lucide-react';
import { db, type LectureNote } from '../../services/database';
import { chatWithLectureTranscript } from '../../services/lectureChat';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
}

export default function ChatPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const transcriptId = searchParams.get('transcriptId');
    const seedPromptParam = searchParams.get('seedPrompt');

    const [lectureNote, setLectureNote] = useState<LectureNote | null>(null);
    const [lectureLoading, setLectureLoading] = useState(false);
    const [lectureError, setLectureError] = useState<string | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const seedAppliedRef = useRef(false);

    const isLectureChat = Boolean(transcriptId && lectureNote?.content?.trim());

    useEffect(() => {
        if (!transcriptId) {
            setLectureNote(null);
            setLectureError(null);
            return;
        }
        let cancelled = false;
        setLectureLoading(true);
        setLectureError(null);
        void db.getLectureNoteById(transcriptId).then((n) => {
            if (cancelled) return;
            if (!n) {
                setLectureNote(null);
                setLectureError('Transcript not found.');
            } else {
                setLectureNote(n);
            }
            setLectureLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [transcriptId]);

    useEffect(() => {
        setMessages([]);
        seedAppliedRef.current = false;
    }, [transcriptId]);

    useEffect(() => {
        if (!lectureNote || !seedPromptParam || seedAppliedRef.current) return;
        seedAppliedRef.current = true;
        try {
            setInputValue(decodeURIComponent(seedPromptParam));
        } catch {
            setInputValue(seedPromptParam);
        }
        const next = new URLSearchParams(searchParams);
        next.delete('seedPrompt');
        setSearchParams(next, { replace: true });
    }, [lectureNote, seedPromptParam, searchParams, setSearchParams]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const clearLectureContext = () => {
        setSearchParams({});
        setLectureNote(null);
        setMessages([]);
        setInputValue('');
        setLectureError(null);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const question = inputValue.trim();

        if (lectureNote?.content?.trim()) {
            const userMessage: ChatMessage = {
                id: `u-${Date.now()}`,
                role: 'user',
                content: question,
            };
            setMessages((prev) => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);
            try {
                const history = messages.map((m) => ({
                    role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                    text: m.content,
                }));
                const { reply } = await chatWithLectureTranscript({
                    transcript: lectureNote.content,
                    title: lectureNote.title,
                    question,
                    history,
                });
                setMessages((prev) => [
                    ...prev,
                    { id: `a-${Date.now()}`, role: 'assistant', content: reply },
                ]);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Could not get a reply.';
                setMessages((prev) => [
                    ...prev,
                    { id: `e-${Date.now()}`, role: 'assistant', content: msg },
                ]);
            } finally {
                setIsTyping(false);
            }
            return;
        }

        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: question,
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `I've analyzed your question. As your study assistant, I recommend focusing on the core principles of "${question}". Open a lecture from your Library to ask questions grounded in that recording.`,
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const bubbleIsUser = (role: ChatRole) => role === 'user';

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-[#f6f6f6] dark:bg-[#0c0c0d]">
            {transcriptId && (
                <div className="shrink-0 z-30 border-b border-border bg-background-elevated/95 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3">
                    <Link
                        to={`/dashboard/transcripts/${transcriptId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-brand-primary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Lecture
                    </Link>
                    {lectureLoading && (
                        <span className="text-xs text-foreground-muted flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Loading…
                        </span>
                    )}
                    {lectureNote && (
                        <span className="text-sm font-bold text-foreground truncate max-w-[min(100%,280px)]">
                            {lectureNote.title}
                        </span>
                    )}
                    {lectureError && <span className="text-xs text-error">{lectureError}</span>}
                    {lectureNote && !lectureNote.content?.trim() && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                            No transcript text on this row — add content on mobile or retry sync.
                        </span>
                    )}
                    {transcriptId && !lectureLoading && (
                        <button
                            type="button"
                            onClick={clearLectureContext}
                            className="ml-auto text-xs font-semibold text-foreground-muted hover:text-foreground"
                        >
                            Clear lecture context
                        </button>
                    )}
                </div>
            )}

            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1] top-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    color: 'var(--color-foreground-muted)',
                }}
            />

            <main className="flex-1 relative z-10 overflow-y-auto scrollbar-hide py-10 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="h-[40vh] flex flex-col items-center justify-end text-center space-y-4 pointer-events-none"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center border border-black/5">
                                {isLectureChat ? (
                                    <MessageCircle className="w-8 h-8 text-brand-primary" />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-indigo-500" />
                                )}
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-foreground">
                                {isLectureChat ? 'Lecture chat' : 'Study Assistant'}
                            </h2>
                            <p className="text-foreground-secondary text-lg font-medium opacity-60 max-w-md">
                                {isLectureChat
                                    ? 'Answers use only this lecture’s transcript (same as the mobile app).'
                                    : 'Your personal intelligence booster. Link a lecture from your Library for grounded Q&A.'}
                            </p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20, rotateX: 10 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`flex ${bubbleIsUser(message.role) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] px-7 py-5 rounded-[2.5rem] text-lg leading-relaxed shadow-sm
                                        ${bubbleIsUser(message.role)
                                            ? 'bg-zinc-900 text-white font-medium rounded-tr-sm'
                                            : 'bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-foreground rounded-tl-sm shadow-xl shadow-black/[0.02]'
                                        }
                                    `}
                                >
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-6 py-4 rounded-[1.5rem] flex gap-2 items-center">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <div className="relative z-20 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                        <div className="bg-white dark:bg-[#111112] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-lg overflow-hidden">
                            <div className="px-6 py-4">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={
                                        lectureNote
                                            ? 'Ask about this lecture…'
                                            : 'Type anything…'
                                    }
                                    rows={2}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            void handleSendMessage();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-foreground placeholder:text-foreground/10 py-0 resize-none leading-relaxed overflow-hidden"
                                />
                            </div>
                            <div className="px-4 pb-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping || (!!transcriptId && lectureLoading)}
                                    className={`p-3 rounded-full transition-all duration-300 ${
                                        inputValue.trim() && !isTyping
                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black scale-100 shadow-xl'
                                            : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 scale-95'
                                    }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `,
                }}
            />
        </div>
    );
}
