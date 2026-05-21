import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Keep in sync with src/constants/downloads.ts */
const url =
  'https://apps.apple.com/us/app/viszmo-ai-study-flashcards/id6760960261';
const outPath = join(__dirname, '..', 'public', 'viszmo-ios-app-qr.png');

const png = await QRCode.toBuffer(url, {
  type: 'png',
  width: 512,
  margin: 2,
  color: { dark: '#0f172a', light: '#ffffff' },
});

await writeFile(outPath, png);
console.log('Wrote', outPath);
