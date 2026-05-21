import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type DownloadEmailProduct = 'windows' | 'ios' | 'desktop' | 'mac-waitlist';

function readBodyError(data: unknown): string | null {
  if (data && typeof data === 'object' && 'error' in data) {
    const e = (data as { error: unknown }).error;
    return typeof e === 'string' ? e : null;
  }
  return null;
}

/** Edge Functions return JSON { error: string } on 4xx/5xx; supabase-js hides that unless we read the Response. */
async function messageFromFunctionsHttpError(error: unknown): Promise<string | null> {
  if (!(error instanceof FunctionsHttpError)) return null;
  try {
    const text = await error.context.text();
    if (!text?.trim()) return null;
    try {
      const json = JSON.parse(text) as { error?: unknown; message?: unknown };
      if (typeof json.error === 'string') return json.error;
      if (typeof json.message === 'string') return json.message;
    } catch {
      /* body wasn't JSON */
    }
    return text.slice(0, 500);
  } catch {
    return null;
  }
}

export async function sendDownloadLinkEmail(
  email: string,
  product: DownloadEmailProduct,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-download-link', {
    body: { email: email.trim(), product },
  });

  const bodyError = readBodyError(data);

  if (error) {
    const fromFn = await messageFromFunctionsHttpError(error);
    throw new Error(fromFn || bodyError || error.message || 'Could not send email');
  }

  if (bodyError) {
    throw new Error(bodyError);
  }
}
