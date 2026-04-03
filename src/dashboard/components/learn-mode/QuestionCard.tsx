import { motion, AnimatePresence } from 'framer-motion';
import { type LearnCard, type QuestionType } from './types';
import { FillBlankQuestion } from './sub-components/FillBlankQuestion';
import { MCQQuestion } from './sub-components/MCQQuestion';
import { WrittenQuestion } from './sub-components/WrittenQuestion';
import { RapidFireMini } from './sub-components/RapidFireMini';
import { MatchingMini } from './sub-components/MatchingMini';
import { generateFillBlank, generateMultipleChoice } from './utils/questionGenerator';
import { useMemo } from 'react';

interface QuestionCardProps {
    card: LearnCard;
    allCards: LearnCard[];
    questionType: QuestionType;
    onAnswer: (isCorrect: boolean, userAnswer?: string) => void;
}

export function QuestionCard({ card, allCards, questionType, onAnswer }: QuestionCardProps) {
    const questionData = useMemo(() => {
        if (questionType === 'fill-blank') {
            return generateFillBlank(card.definition);
        } else if (questionType === 'multiple-choice') {
            return generateMultipleChoice(card, allCards);
        }
        return null;
    }, [card.id, questionType, allCards]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex flex-col items-center justify-center p-6"
        >
            <AnimatePresence mode="wait">
                {questionType === 'fill-blank' && questionData && (
                    <FillBlankQuestion
                        key="fill"
                        question={(questionData as any).question}
                        answer={(questionData as any).answer}
                        onAnswer={(correct) => onAnswer(correct)}
                    />
                )}
                {questionType === 'multiple-choice' && questionData && (
                    <MCQQuestion
                        key="mcq"
                        question={(questionData as any).question}
                        options={(questionData as any).options}
                        onAnswer={(correct) => onAnswer(correct)}
                        correctIndex={(questionData as any).correctIndex}
                    />
                )}
                {questionType === 'written' && (
                    <WrittenQuestion
                        key="written"
                        term={card.term}
                        onAnswer={(ans) => onAnswer(true, ans)} // Pass to parent for LCS grading
                    />
                )}
                {questionType === 'rapid-fire' && (
                    <RapidFireMini
                        key="rapid"
                        card={card}
                        onComplete={(passed) => onAnswer(passed)}
                    />
                )}
                {questionType === 'matching' && (
                    <MatchingMini
                        key="match"
                        card={card}
                        neighbors={allCards.filter(c => c.id !== card.id).slice(0, 5)} // Pass a few extras to pick from
                        onComplete={(passed) => onAnswer(passed)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
