import { supabase } from '../lib/supabase';

export type DownloadEmailProduct = 'windows' | 'ios' | 'desktop';

function readBodyError(data: unknown): string | null {
  if (data && typeof data === 'object' && 'error' in data) {
    const e = (data as { error: unknown }).error;
    return typeof e === 'string' ? e : null;
  }
  return null;
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
    throw new Error(bodyError || error.message || 'Could not send email');
  }

  if (bodyError) {
    throw new Error(bodyError);
  }
}
