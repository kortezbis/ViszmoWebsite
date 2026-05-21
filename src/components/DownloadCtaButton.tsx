import { usePreviewMode } from '../contexts/PreviewModeContext';
import { getDesktopDownloadLabel, type DownloadCtaVariant } from '../lib/downloadCta';
import { PlatformDownloadIcon } from './PlatformDownloadIcons';

type DownloadCtaButtonProps = {
    onClick?: () => void;
    variant?: DownloadCtaVariant;
    className?: string;
    showIcon?: boolean;
    iconClassName?: string;
};

export function DownloadCtaButton({
    onClick = () => {},
    variant = 'download-now',
    className = 'btn',
    showIcon = true,
    iconClassName = 'btn-svg',
}: DownloadCtaButtonProps) {
    const { isApplePlatform, isMobile } = usePreviewMode();
    const label = getDesktopDownloadLabel(isApplePlatform, isMobile, variant);

    return (
        <button type="button" className={className} onClick={onClick}>
            {showIcon ? <PlatformDownloadIcon isApple={isApplePlatform} className={iconClassName} /> : null}
            <span className="btn-text">{label}</span>
        </button>
    );
}

/** Hook for pages that render custom button markup but need the same labels. */
export function useDesktopDownloadLabel(variant: DownloadCtaVariant = 'download-now') {
    const { isApplePlatform, isMobile } = usePreviewMode();
    return getDesktopDownloadLabel(isApplePlatform, isMobile, variant);
}
