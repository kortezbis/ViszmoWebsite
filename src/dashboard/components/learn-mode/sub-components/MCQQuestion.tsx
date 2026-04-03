import { motion } from 'framer-motion';

interface MCQQuestionProps {
    question: string;
    options: string[];
    onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
    correctIndex: number;
}

export function MCQQuestion({ question, options, onAnswer, correctIndex }: MCQQuestionProps) {
    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
            <h3 className="text-3xl font-black text-center tracking-tight mb-4">
                {question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 136, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAnswer(index === correctIndex, index)}
                        className="p-6 text-left bg-surface border border-border rounded-3xl hover:border-brand-primary/50 transition-all group flex items-start gap-4"
                    >
                        <div className="w-8 h-8 rounded-lg bg-surface-active border border-border flex items-center justify-center text-xs font-black text-foreground-muted group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-colors shrink-0">
                            {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg font-medium leading-relaxed">{option}</span>
                    </motion.button>
                ))}
            </div>

            <p className="text-center text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Select the best answer</p>
        </div>
    );
}
