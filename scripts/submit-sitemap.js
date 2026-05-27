/**
 * One-time / CLI script to read public/sitemap.xml and submit all URLs to IndexNow.
 * Run this script using: node scripts/submit-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pingIndexNow } from './indexnow-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

async function submitSitemap() {
  console.log('[Sitemap Submit] Reading local sitemap.xml...');

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`[Sitemap Submit] Sitemap file not found at: ${SITEMAP_PATH}`);
    process.exit(1);
  }

  try {
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    
    // Use regex to find all <loc>...</loc> tags
    const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    const urls = [];
    let match;

    while ((match = locRegex.exec(sitemapContent)) !== null) {
      urls.push(match[1].trim());
    }

    if (urls.length === 0) {
      console.warn('[Sitemap Submit] No URLs found in sitemap.xml.');
      process.exit(0);
    }

    console.log(`[Sitemap Submit] Found ${urls.length} URLs in sitemap.xml.`);
    
    const success = await pingIndexNow(urls);
    if (success) {
      console.log('[Sitemap Submit] All URLs successfully submitted to IndexNow!');
    } else {
      console.error('[Sitemap Submit] Failed to submit URLs to IndexNow.');
      process.exit(1);
    }
  } catch (error) {
    console.error('[Sitemap Submit] Error during sitemap submission:', error.message || error);
    process.exit(1);
  }
}

submitSitemap();
