/**
 * Flip to true when macOS desktop is generally available — restores original CTA labels.
 */
export const MAC_DESKTOP_AVAILABLE = false;

export type DownloadCtaVariant =
    | 'download-now'
    | 'get-free'
    | 'get-now'
    | 'try-free'
    | 'add-free'
    | 'get-tutor'
    | 'start-faster';

const WINDOWS_LABELS: Record<DownloadCtaVariant, string> = {
    'download-now': 'Download Now',
    'get-free': 'Get Viszmo Free',
    'get-now': 'Get Viszmo Now',
    'try-free': 'Try Viszmo Free',
    'add-free': 'Add Viszmo Free',
    'get-tutor': 'Get Your AI Tutor Now',
    'start-faster': 'Start Studying Faster',
};

/**
 * Primary desktop download CTA copy.
 * Mac users see "Coming Soon" until MAC_DESKTOP_AVAILABLE is enabled.
 */
export function getDesktopDownloadLabel(
    isApple: boolean,
    isMobile: boolean,
    variant: DownloadCtaVariant = 'download-now',
): string {
    if (isApple && !MAC_DESKTOP_AVAILABLE) {
        return 'Coming Soon';
    }
    if (isMobile) {
        return 'Send download link';
    }
    return WINDOWS_LABELS[variant];
}

export function isMacDesktopComingSoon(isApple: boolean): boolean {
    return isApple && !MAC_DESKTOP_AVAILABLE;
}
