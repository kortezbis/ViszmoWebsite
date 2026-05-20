/**
 * True when the user is likely on a phone/tablet or a narrow viewport,
 * so we prefer email-me-a-link instead of triggering a raw file download.
 */
export function isMobileClient(): boolean {
  if (typeof window === 'undefined') return false;
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const ua = navigator.userAgent || '';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mobileUa =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      ua,
    );
  return narrow || mobileUa || coarse;
}
