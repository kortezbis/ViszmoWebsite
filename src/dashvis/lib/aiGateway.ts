import { supabase } from './supabase'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined ?? '').replace(/\/$/, '')
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined ?? ''

type AiGatewayResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

/**
 * Calls the Viszmo AI Gateway (same Edge Function as the iOS app).
 * Requires an active Supabase session.
 */
export async function invokeAiGateway<T>(
  operation: string,
  payload: Record<string, unknown>,
  options?: { signal?: AbortSignal }
): Promise<T> {
  if (!SUPABASE_URL) throw new Error('AI features are not available — missing Supabase URL.')

  const client = supabase
  if (!client) throw new Error('Supabase is not configured.')

  const { data: { session } } = await client.auth.getSession()
  if (!session?.access_token) throw new Error('Sign in to use this feature.')

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON,
    },
    body: JSON.stringify({ operation, payload }),
    signal: options?.signal,
  })

  let body: AiGatewayResponse<T> | null = null
  try {
    body = (await res.json()) as AiGatewayResponse<T>
  } catch {
    /* non-JSON body */
  }

  if (body && typeof body === 'object' && 'ok' in body) {
    if (!body.ok) {
      throw new Error(body.error || 'AI generation failed. Please try again.')
    }
    return body.data as T
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error('Session expired. Please sign in again.')
  }

  throw new Error(`Server error (${res.status}). Please try again.`)
}

// ——— Typed helpers (mirrors gemini.ts from iOS app) ———

export interface Flashcard {
  front: string
  back: string
}

function withCountInstruction(prompt: string, count?: number): string {
  if (!count || count < 1) return prompt
  return `${prompt}\n\nReturn exactly ${count} flashcards as concise Q/A study cards.`
}

export const generateFlashcardsFromText = (text: string, count?: number): Promise<Flashcard[]> =>
  invokeAiGateway<Flashcard[]>('flashcards_from_prompt', { prompt: withCountInstruction(text, count), count })

export const generateFlashcardsFromImages = (
  images: { base64: string; mimeType: string }[],
  count?: number
): Promise<Flashcard[]> =>
  invokeAiGateway<Flashcard[]>('flashcards_from_images', { images, count })

export const generateFlashcardsFromYouTube = async (url: string, count?: number): Promise<Flashcard[]> => {
  // The gateway expects a prompt; we send the YouTube URL as context for extraction
  const prompt = `Extract key concepts from this YouTube video and generate comprehensive flashcards. Video URL: ${url}`
  return invokeAiGateway<Flashcard[]>('flashcards_from_prompt', { prompt: withCountInstruction(prompt, count), count })
}

export const generateFlashcardsFromSubject = (subject: string, count?: number): Promise<Flashcard[]> => {
  const prompt = `Generate comprehensive study flashcards for the subject: "${subject}". Cover key concepts, definitions, formulas, and important facts.`
  return invokeAiGateway<Flashcard[]>('flashcards_from_prompt', { prompt: withCountInstruction(prompt, count), count })
}

export const generateFlashcardsFromLink = async (url: string, count?: number): Promise<Flashcard[]> => {
  const prompt = `Generate flashcards from the content at this URL: ${url}. Focus on key facts, definitions, and concepts.`
  return invokeAiGateway<Flashcard[]>('flashcards_from_prompt', { prompt: withCountInstruction(prompt, count), count })
}

export const transcribeAudio = (base64Data: string): Promise<string> =>
  invokeAiGateway<string>('transcribe_audio', { base64Data })

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export const chatGeneral = (question: string, history: ChatMessage[] = []): Promise<{ reply: string }> =>
  invokeAiGateway<{ reply: string }>('general_chat', { question, history })

export interface PodcastScript {
  title: string
  intro: string
  segments: {
    speaker: string
    text: string
  }[]
  outro: string
}

export const generatePodcastScript = async (topic: string, content: string): Promise<PodcastScript> => {
  const question = `Create a conversational podcast script (host-style) summarizing the following study material about "${topic}". 
  The podcast should be engaging, educational, and easy to listen to. 
  Include an intro, several segments with speaker names (e.g., "Host"), and an outro.
  
  Material:
  ${content}
  
  Format the output as JSON with the following structure:
  {
    "title": "Podcast Title",
    "intro": "Intro text...",
    "segments": [{ "speaker": "Host", "text": "Segment text..." }],
    "outro": "Outro text..."
  }
  
  Return ONLY the JSON object, no other text.`
  
  const res = await invokeAiGateway<{ reply: string }>('general_chat', { question, history: [] })
  
  try {
    // Attempt to extract JSON if there's markdown or extra text
    const jsonMatch = res.reply.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : res.reply
    return JSON.parse(jsonStr) as PodcastScript
  } catch (e) {
    console.error('Failed to parse podcast script JSON:', e, res.reply)
    throw new Error('AI returned an invalid podcast script format.')
  }
}
