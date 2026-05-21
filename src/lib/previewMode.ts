/** Legacy dev preview keys — cleared on startup so detection stays automatic. */
const LEGACY_MOBILE_PREVIEW_KEY = 'viszmo_preview_mobile_v1';
const LEGACY_PLATFORM_PREVIEW_KEY = 'viszmo_preview_platform_v1';

export function clearLegacyPreviewOverrides(): void {
  try {
    localStorage.removeItem(LEGACY_MOBILE_PREVIEW_KEY);
    localStorage.removeItem(LEGACY_PLATFORM_PREVIEW_KEY);
  } catch {
    /* blocked */
  }
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const ua = navigator.userAgent || '';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mobileUa =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  return narrow || mobileUa || coarse;
}

function detectApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const p = (navigator.platform || '').toUpperCase();
  const ua = navigator.userAgent || '';
  return (
    p.includes('MAC') ||
    p.includes('IPHONE') ||
    p.includes('IPAD') ||
    /Mac|iPhone|iPad|iPod/i.test(ua)
  );
}

/** Phone/tablet or narrow viewport — prefer email download link flow. */
export function isMobileClient(): boolean {
  return detectMobile();
}

/** macOS / iOS user agent — Apple icon and Mac waitlist CTAs. */
export function isApplePlatformClient(): boolean {
  return detectApplePlatform();
}

export function isWindowsPlatformClient(): boolean {
  return !isApplePlatformClient();
}
