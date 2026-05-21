/** Viszmo on the App Store — used for QR codes and iOS download links. */
export const IOS_APP_STORE_URL =
  'https://apps.apple.com/us/app/viszmo-ai-study-flashcards/id6760960261';

/** Public asset: QR code encoding {@link IOS_APP_STORE_URL}. Regenerate with `node scripts/generate-ios-qr.mjs`. */
export const IOS_APP_QR_IMAGE_PATH = '/viszmo-ios-app-qr.png';

/**
 * Direct Windows installer (.exe). Override via Supabase secret WINDOWS_INSTALLER_URL
 * when you host the file on your own domain/CDN (recommended — users never see GitHub).
 */
export const WINDOWS_INSTALLER_URL =
  'https://github.com/Kortezbis/DeskApp-Vis/releases/latest/download/Viszmo-Setup.exe';
