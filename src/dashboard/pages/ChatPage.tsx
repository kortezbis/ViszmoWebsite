import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Send,
    Plus,
    History,
    Maximize2,
    Type,
    Bold,
    Italic,
    Link2,
    Smile,
    AtSign,
    Sparkles,
    AudioLines,
    MoreHorizontal,
    ChevronDown
} from 'lucide-react';

export default function ChatPage() {
    const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `I've analyzed your question. As your study assistant, I recommend focusing on the core principles of "${newUserMessage.content}". Would you like me to generate some practice questions based on this?`
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-[#f6f6f6] dark:bg-[#0c0c0d]">
            {/* School Dot Pattern Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    color: 'var(--color-foreground-muted)'
                }}
            />

            {/* Chat Area */}
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
                                <Sparkles className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-foreground">Study Assistant</h2>
                            <p className="text-foreground-secondary text-lg font-medium opacity-60">Your personal intelligence booster.</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20, rotateX: 10 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] px-7 py-5 rounded-[2.5rem] text-lg leading-relaxed shadow-sm
                                        ${message.role === 'user'
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
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Hyper Modern "Editor-Style" Input Area */}
            <div className="relative z-20 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-[#111112] border border-black/5 dark:border-white/5 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 group">

                        {/* Top Toolbar (Minimal) */}
                        <div className="flex items-center gap-2 p-3 px-6 border-b border-black/[0.03] dark:border-white/[0.03]">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#f4f4f5] dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-2xl text-[13px] font-bold text-foreground transition-all">
                                Regular Font
                                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                            </button>
                            <div className="w-px h-6 bg-black/[0.05] dark:bg-white/[0.05] mx-1" />
                            <button className="p-2 text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                                <Italic className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                                <Link2 className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSendMessage} className="flex flex-col">
                            {/* Main Input Region */}
                            <div className="px-8 py-6">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type anything..."
                                    rows={2}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none focus:ring-0 text-2xl font-medium text-foreground placeholder:text-foreground/10 py-0 resize-none leading-relaxed overflow-hidden"
                                />
                            </div>

                            {/* Floating Action Bar */}
                            <div className="mx-6 mb-6 p-2 bg-[#1e1e20] dark:bg-black rounded-[2rem] flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-1 pl-2">
                                    <button type="button" className="p-2.5 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="p-2.5 text-white/40 hover:text-white rounded-full transition-all">
                                        <AtSign className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="p-2.5 text-white/40 hover:text-white rounded-full transition-all">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <button type="button" className="p-2.5 text-white/40 hover:text-white rounded-full transition-all flex items-center gap-2">
                                        <AudioLines className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 pr-1">
                                    <button type="button" className="p-2.5 text-white/40 hover:text-white rounded-full transition-all">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className={`ml-2 p-3 rounded-full transition-all duration-300 ${inputValue.trim()
                                                ? 'bg-white text-black scale-100 shadow-xl'
                                                : 'bg-white/10 text-white/20 scale-95'
                                            }`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
