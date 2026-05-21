import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearLegacyPreviewOverrides,
  isApplePlatformClient,
  isMobileClient,
} from '../lib/previewMode';

type DeviceContextValue = {
  isMobile: boolean;
  isApplePlatform: boolean;
};

const PreviewModeContext = createContext<DeviceContextValue | null>(null);

function readDeviceState(): DeviceContextValue {
  return {
    isMobile: isMobileClient(),
    isApplePlatform: isApplePlatformClient(),
  };
}

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceContextValue>(readDeviceState);

  useEffect(() => {
    clearLegacyPreviewOverrides();

    const sync = () => setDevice(readDeviceState());

    const narrowMq = window.matchMedia('(max-width: 767px)');
    const coarseMq = window.matchMedia('(pointer: coarse)');

    narrowMq.addEventListener('change', sync);
    coarseMq.addEventListener('change', sync);
    window.addEventListener('resize', sync);

    return () => {
      narrowMq.removeEventListener('change', sync);
      coarseMq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const value = useMemo(() => device, [device.isMobile, device.isApplePlatform]);

  return (
    <PreviewModeContext.Provider value={value}>{children}</PreviewModeContext.Provider>
  );
}

export function usePreviewMode(): DeviceContextValue {
  const ctx = useContext(PreviewModeContext);
  if (!ctx) {
    throw new Error('usePreviewMode must be used within PreviewModeProvider');
  }
  return ctx;
}
