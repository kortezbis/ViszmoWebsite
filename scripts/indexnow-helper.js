/**
 * IndexNow Helper for viszmo.com
 * Sends URL submission requests to the IndexNow API.
 */

export const INDEXNOW_KEY = '7d04e578c772421db028b3e8e2fa51c8';
export const INDEXNOW_HOST = 'www.viszmo.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Pings the IndexNow endpoint with the list of URLs.
 * @param {string[]} urlList - List of full canonical URLs to submit.
 * @returns {Promise<boolean>} Resolves to true on success, false on failure.
 */
export async function pingIndexNow(urlList) {
  if (!urlList || urlList.length === 0) {
    console.log('[IndexNow] No URLs provided to submit.');
    return false;
  }

  // Ensure all URLs start with the canonical scheme and host
  const normalizedUrls = urlList.map(url => {
    if (url.startsWith('/')) {
      return `https://${INDEXNOW_HOST}${url}`;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${INDEXNOW_HOST}/${url}`;
    }
    return url;
  });

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: normalizedUrls
  };

  console.log(`[IndexNow] Submitting ${normalizedUrls.length} URLs to IndexNow...`);
  normalizedUrls.forEach(url => console.log(`  - ${url}`));

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`[IndexNow] Success! Response status: ${response.status} (${response.statusText})`);
      return true;
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {}
      console.error(`[IndexNow] Failed to submit. Status: ${response.status} ${response.statusText}. Response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('[IndexNow] Request error:', error.message || error);
    return false;
  }
}
