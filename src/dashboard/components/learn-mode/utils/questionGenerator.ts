import { type LearnCard, type QuestionType } from '../types';

/**
 * Extracts key technical words from a definition to create fill-in-the-blank questions.
 * Uses a heuristic of finding long words or capitalized words.
 */
export function extractKeywords(definition: string): string[] {
    // Simple heuristic: words longer than 5 chars, excluding common stop words
    const stopWords = new Set(['the', 'this', 'that', 'with', 'from', 'their', 'which', 'about', 'would', 'these', 'could']);
    const words = definition.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, ''));

    return words.filter(w => w.length > 5 && !stopWords.has(w.toLowerCase()));
}

export function generateFillBlank(definition: string): { question: string; answer: string } {
    const keywords = extractKeywords(definition);
    if (keywords.length === 0) {
        // Fallback: pick the longest word
        const words = definition.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, ''));
        const fallback = words.reduce((a, b) => a.length > b.length ? a : b);
        return {
            question: definition.replace(new RegExp(`\\b${fallback}\\b`, 'g'), '_____'),
            answer: fallback
        };
    }

    // Pick a random keyword from the top few
    const keywordToBlank = keywords[Math.floor(Math.random() * Math.min(keywords.length, 3))];

    return {
        question: definition.replace(new RegExp(`\\b${keywordToBlank}\\b`, 'g'), '_____'),
        answer: keywordToBlank
    };
}

export function generateMultipleChoice(currentCard: LearnCard, allCards: LearnCard[]): {
    question: string;
    options: string[];
    correctIndex: number;
} {
    // Show term, ask for definition
    const distractors = allCards
        .filter(c => c.id !== currentCard.id)
        .map(c => c.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3); // Get 3 wrong answers

    const options = [currentCard.definition, ...distractors].sort(() => Math.random() - 0.5);

    return {
        question: `What is ${currentCard.term}?`,
        options,
        correctIndex: options.indexOf(currentCard.definition)
    };
}

export function pickRandomQuestionType(exclude?: QuestionType): QuestionType {
    const types: QuestionType[] = ['fill-blank', 'multiple-choice', 'written'];
    const filtered = exclude ? types.filter(t => t !== exclude) : types;
    return filtered[Math.floor(Math.random() * filtered.length)];
}
