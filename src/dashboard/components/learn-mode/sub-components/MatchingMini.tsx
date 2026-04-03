import { useState, useEffect } from 'react';
import { type LearnCard } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchingMiniProps {
    card: LearnCard;
    neighbors: LearnCard[];
    onComplete: (passed: boolean) => void;
}

export function MatchingMini({ card, neighbors, onComplete }: MatchingMiniProps) {
    // Combine current card + 2 neighbors
    const pairs = [
        { id: card.id, term: card.term, definition: card.definition },
        ...neighbors.slice(0, 2).map(c => ({ id: c.id, term: c.term, definition: c.definition }))
    ];

    const [leftCols, setLeftCols] = useState(() => pairs.sort(() => Math.random() - 0.5));
    const [rightCols, setRightCols] = useState(() => pairs.sort(() => Math.random() - 0.5));

    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [selectedRight, setSelectedRight] = useState<number | null>(null);
    const [matches, setMatches] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);

    const handleMatch = (leftId: number, rightId: number) => {
        if (leftId === rightId) {
            setMatches(m => [...m, leftId]);
            setSelectedLeft(null);
            setSelectedRight(null);

            if (matches.length === 2) { // Logic: 2 matches + 1 just made = 3 total
                setTimeout(() => onComplete(true), 1000);
            }
        } else {
            // Wrong
            setAttempts(a => a + 1);
            setSelectedLeft(null);
            setSelectedRight(null);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
            <div className="space-y-4">
                {leftCols.map(p => (
                    <motion.button
                        key={`L-${p.id}`}
                        onClick={() => {
                            if (matches.includes(p.id)) return;
                            if (selectedRight) {
                                handleMatch(p.id, selectedRight);
                            } else {
                                setSelectedLeft(p.id);
                            }
                        }}
                        className={`w-full p-4 rounded-xl border font-bold text-left transition-all ${matches.includes(p.id) ? 'opacity-0 pointer-events-none' :
                                selectedLeft === p.id ? 'border-brand-primary bg-brand-primary/10' : 'border-border hover:bg-surface-hover'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {p.term}
                    </motion.button>
                ))}
            </div>

            <div className="space-y-4">
                {rightCols.map(p => (
                    <motion.button
                        key={`R-${p.id}`}
                        onClick={() => {
                            if (matches.includes(p.id)) return;
                            if (selectedLeft) {
                                handleMatch(selectedLeft, p.id);
                            } else {
                                setSelectedRight(p.id);
                            }
                        }}
                        className={`w-full p-4 rounded-xl border text-sm text-left transition-all truncate-2 ${matches.includes(p.id) ? 'opacity-0 pointer-events-none' :
                                selectedRight === p.id ? 'border-brand-primary bg-brand-primary/10' : 'border-border hover:bg-surface-hover'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {p.definition}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
