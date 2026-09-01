import { WorldCatAdapter } from '../adapters/worldcatAdapter.js';
import { getCached, setCached, cacheKey } from './cache.js';

// The adapter is swappable: replace this single line to point the whole
// extension at a different data source without touching content scripts.
const adapter = new WorldCatAdapter();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'FIND_LIBRARY_HOLDINGS') return false;

  handleLookup(message.payload)
    .then(sendResponse)
    .catch((err) => {
      console.error('[service-worker] lookup failed', err);
      sendResponse({ error: 'lookup_failed' });
    });

  return true; // keep the message channel open for the async response
});

async function handleLookup({ book, zip } = {}) {
  if (!zip) return { error: 'missing_zip' };
  if (!book?.isbn) return { error: 'missing_isbn' };

  const key = cacheKey(book.isbn, zip);
  const cached = getCached(key);
  if (cached) return { holdings: cached, fromCache: true };

  const holdings = await adapter.findHoldings(book, zip);
  setCached(key, holdings);
  return { holdings, fromCache: false };
}
