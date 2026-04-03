import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, CheckCircle, XCircle } from 'lucide-react';
import { type LearnCard } from '../types';

interface RapidFireMiniProps {
    card: LearnCard;
    onComplete: (passed: boolean) => void;
}

export function RapidFireMini({ card, onComplete }: RapidFireMiniProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    // Mock questions for now - In production, generate via AI or distractors
    const [questions] = useState(() => [
        {
            q: `Which concept relates to ${card.term}?`,
            options: [card.definition.substring(0, 20) + '...', 'Irrelevant A', 'Irrelevant B'],
            correct: 0
        },
        {
            q: `Is ${card.term} a physical device?`,
            options: ['Yes', 'No', 'Depends'],
            correct: 1
        },
        {
            q: `Why is ${card.term} important?`,
            options: ['Security', 'Speed', 'Cost'],
            correct: 0
        }
    ]);

    useEffect(() => {
        if (finished) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time's up
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion, finished]);

    const handleAnswer = (index: number) => {
        if (index === questions[currentQuestion].correct) {
            setScore(s => s + 1);
        }

        if (currentQuestion < 2) {
            setCurrentQuestion(prev => prev + 1);
            setTimeLeft(10);
        } else {
            setFinished(true);
            setTimeout(() => {
                onComplete(score >= 2); // Pass if >= 2/3
            }, 1500);
        }
    };

    if (finished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl">
                <h3 className="text-2xl font-bold mb-4">Round Complete</h3>
                <div className="text-4xl font-black mb-2">{score}/3</div>
                <p className={score >= 2 ? "text-success font-bold" : "text-error font-bold"}>
                    {score >= 2 ? "PASSED" : "TRY AGAIN"}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-warning">
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="font-bold uppercase tracking-wider text-xs">Rapid Fire {currentQuestion + 1}/3</span>
                </div>
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-foreground-muted" />
                    <span className={`font-mono font-bold text-lg ${timeLeft <= 3 ? 'text-error animate-pulse' : ''}`}>
                        {timeLeft}s
                    </span>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-6">{questions[currentQuestion].q}</h3>

            <div className="space-y-3">
                {questions[currentQuestion].options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className="w-full p-4 text-left rounded-xl border border-border hover:bg-surface-hover hover:border-brand-primary transition-all font-medium"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
