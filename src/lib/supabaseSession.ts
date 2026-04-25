import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Wait until Supabase has a session (mirrors mobile `waitForSupabaseSession`).
 * Used before RLS-protected queries so the JWT is attached.
 */
export async function waitForSupabaseSession(timeoutMs = 3500): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) return;
        await new Promise((r) => setTimeout(r, 50));
    }
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
        throw new Error('Not authenticated - please sign in again.');
    }
}

/** Resolved user after session is ready (prefer this over caching during DB calls). */
export async function getAuthenticatedUser(): Promise<User> {
    await waitForSupabaseSession();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();
    if (error || !user) {
        console.error('[Supabase] getUser failed:', error?.message);
        throw new Error('Not authenticated - please sign in again.');
    }
    return user;
}
