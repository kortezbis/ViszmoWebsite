/**
 * localStorage: set when the user dismisses the auto mobile prompt or successfully
 * receives a desktop download link email — avoids repeating on every visit.
 */
export const MOBILE_DESKTOP_LINK_PROMPT_STORAGE_KEY = 'viszmo_mobile_desktop_link_prompt_v1';

export function markMobileDesktopLinkPromptComplete(): void {
  try {
    localStorage.setItem(MOBILE_DESKTOP_LINK_PROMPT_STORAGE_KEY, '1');
  } catch {
    /* private / blocked storage */
  }
}

export { isMobileClient } from './previewMode';

