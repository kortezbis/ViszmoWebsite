import { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle } from 'lucide-react';

interface WrittenQuestionProps {
    term: string;
    onAnswer: (answer: string) => void;
}

export function WrittenQuestion({ term, onAnswer }: WrittenQuestionProps) {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        onAnswer(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 bg-brand-primary/10 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">Mastery Check</span>
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                    What is <span className="text-brand-primary underline decoration-brand-primary/30 underline-offset-8">"{term}"</span>?
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="w-full relative group">
                <div className="relative bg-surface rounded-3xl border-2 border-border-strong focus-within:border-brand-primary transition-all p-6 shadow-2xl">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Explain this concept in your own words..."
                        className="w-full bg-transparent border-none outline-none text-2xl font-medium text-center text-foreground placeholder-foreground-muted/50 resize-none min-h-[160px] leading-relaxed"
                        spellCheck={false}
                    />

                    <div className="absolute right-6 bottom-6 flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-foreground-muted uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <HelpCircle className="w-3 h-3" /> Shift + Enter for newline
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                ${inputValue.trim()
                                    ? 'bg-brand-primary text-black shadow-[0_4px_16px_rgba(0,255,136,0.3)] hover:scale-105 active:scale-95'
                                    : 'bg-surface-active text-foreground-muted opacity-50'}
                            `}
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </form>

            <p className="mt-8 text-xs font-bold text-foreground-muted uppercase tracking-widest">Accuracy threshold: 85%</p>
        </div>
    );
}
