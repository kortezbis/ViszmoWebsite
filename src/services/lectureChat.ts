import { invokeAiGateway } from './aiGateway';

/** Q&A grounded only in the lecture transcript (same operation as mobile `chatWithLectureTranscript`). */
export async function chatWithLectureTranscript(params: {
    transcript: string;
    title?: string;
    question: string;
    history?: { role: 'user' | 'assistant'; text: string }[];
}): Promise<{ reply: string }> {
    return invokeAiGateway<{ reply: string }>('transcript_chat', params as Record<string, unknown>);
}
