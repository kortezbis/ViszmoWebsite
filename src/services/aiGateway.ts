import { supabase } from '../lib/supabase';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

type AiGatewayResponse<T> = {
    ok: boolean;
    data?: T;
    error?: string;
};

const LEAKY =
    /openai|supabase|anthropic|gemini|azure|bearer\s|api[_-]?key|service[_-]?role|edge\s*function|ai-gateway|functions\/v1|deno|postgres|jwt|sk-proj|sk_live|sk_test/i;

function gatewayUserMessage(serverError: string | undefined, httpStatus: number): string {
    const raw = (serverError || '').trim();

    if (/daily.*limit|limit reached|try again tomorrow/i.test(raw)) {
        return "You've reached today's limit for this feature. Try again tomorrow.";
    }
    if (/too many requests|rate limit|429/i.test(raw) || httpStatus === 429) {
        return "You're doing that too often. Please wait a bit and try again.";
    }
    if (/sign in|session expired|not authenticated|invalid.*session/i.test(raw)) {
        return 'Session expired. Please sign in again.';
    }

    if (import.meta.env.DEV && raw && !LEAKY.test(raw)) {
        return raw;
    }

    return 'Something went wrong. Please try again.';
}

/**
 * Calls the same Supabase Edge `ai-gateway` as iOS (`invokeAiGateway` in `services/aiGateway.ts`).
 */
export async function invokeAiGateway<T>(
    operation: string,
    payload: Record<string, unknown>,
    options?: { signal?: AbortSignal },
): Promise<T> {
    if (!SUPABASE_URL) {
        throw new Error('This feature is not available right now. Please try again later.');
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Sign in to use this feature.');
    }

    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-gateway`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON,
        },
        body: JSON.stringify({ operation, payload }),
        signal: options?.signal,
    });

    let body: AiGatewayResponse<T> | null = null;
    try {
        body = (await res.json()) as AiGatewayResponse<T>;
    } catch {
        /* non-JSON */
    }

    if (body && typeof body === 'object' && 'ok' in body) {
        if (!body.ok) {
            const msg = body.error || '';
            if (/Unknown operation:\s*transcript_chat/i.test(msg)) {
                throw new Error(
                    import.meta.env.DEV
                        ? 'Transcript Q&A is not enabled in this environment yet.'
                        : 'This feature is temporarily unavailable. Please try again later.',
                );
            }
            throw new Error(gatewayUserMessage(msg, res.status));
        }
        return body.data as T;
    }

    if (res.status === 401 || res.status === 403) {
        throw new Error('Session expired. Please sign in again.');
    }

    throw new Error(gatewayUserMessage(undefined, res.status));
}
