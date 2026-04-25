import { invokeAiGateway } from './aiGateway';

export interface GeneratedCard {
    front: string;
    back: string;
}

interface GenerateFromTextResult {
    cards: GeneratedCard[];
}

/**
 * Calls the same `generate_flashcards` operation used by the iOS app.
 * Payload mirrors mobile `aiGateway.invokeAiGateway('generate_flashcards', { text })`.
 */
export async function generateFlashcardsFromText(
    text: string,
    signal?: AbortSignal,
): Promise<GeneratedCard[]> {
    const result = await invokeAiGateway<GenerateFromTextResult>(
        'generate_flashcards',
        { text },
        { signal },
    );
    return result?.cards ?? [];
}

interface AddCardsResult {
    cards: GeneratedCard[];
}

/**
 * Calls `add_cards_to_deck` — used by the "Magic Add" prompt bar in the editor.
 * Mirrors mobile deck-editor AI card addition.
 */
export async function generateCardsFromPrompt(
    prompt: string,
    context?: string,
    signal?: AbortSignal,
): Promise<GeneratedCard[]> {
    const result = await invokeAiGateway<AddCardsResult>(
        'add_cards_to_deck',
        { prompt, ...(context ? { context } : {}) },
        { signal },
    );
    return result?.cards ?? [];
}

interface ProcessFileResult {
    cards: GeneratedCard[];
}

/**
 * Calls `process_file` — used when user uploads a PDF/PPT/audio/video.
 * Mirrors mobile file-import flow.
 */
export async function generateFlashcardsFromFile(
    storageUrl: string,
    mimeType: string,
    signal?: AbortSignal,
): Promise<GeneratedCard[]> {
    const result = await invokeAiGateway<ProcessFileResult>(
        'process_file',
        { url: storageUrl, mimeType },
        { signal },
    );
    return result?.cards ?? [];
}
