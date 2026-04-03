import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface FillBlankQuestionProps {
    question: string;
    answer: string;
    onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

export function FillBlankQuestion({ question, answer, onAnswer }: FillBlankQuestionProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const isCorrect = inputValue.toLowerCase().trim() === answer.toLowerCase().trim();
        onAnswer(isCorrect, inputValue);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-3xl font-bold mb-12 text-center leading-relaxed max-w-2xl">
                {question.split('_____').map((part, i, arr) => (
                    <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                            <span className="inline-block border-b-4 border-brand-primary min-w-[120px] mx-2 text-brand-primary">
                                {inputValue || '_____'}
                            </span>
                        )}
                    </span>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type the missing word..."
                    className="w-full bg-surface-active border-2 border-border-strong rounded-2xl px-6 py-5 text-xl font-bold text-center focus:border-brand-primary transition-all outline-none"
                    spellCheck={false}
                    autoFocus
                />

                <button
                    type="submit"
                    className={`
                        absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all
                        ${inputValue.trim() ? 'bg-brand-primary text-black scale-100' : 'bg-surface text-foreground-muted scale-90 opacity-0'}
                    `}
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>

            <p className="mt-6 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Type and press Enter</p>
        </div>
    );
}
