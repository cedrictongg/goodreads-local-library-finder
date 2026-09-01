import { LibraryAdapter } from './libraryAdapter.js';
import { ensureOffscreenDocument } from '../background/offscreenManager.js';

// WorldCat Search API v1 was retired 2024-12-31 and v2 requires a paid
// OCLC WSKey subscription, so neither qualifies as a free, non-deprecated
// API per the project requirements. We instead fetch the same public,
// signed-out HTML page a browser would receive and parse it off-thread in
// an offscreen document (see docs/EXTERNAL_ENDPOINTS.md for the rationale
// and docs/ARCHITECTURE.md for the data-flow diagram).
const WORLDCAT_ORIGIN = 'https://search.worldcat.org';
const REQUEST_TIMEOUT_MS = 8000;

export class WorldCatAdapter extends LibraryAdapter {
  async findHoldings(book, zip) {
    if (!book?.isbn) return [];

    const searchUrl = `${WORLDCAT_ORIGIN}/search?q=bn%3A${encodeURIComponent(book.isbn)}`;
    const html = await this._fetchHtml(searchUrl);
    if (!html) return [];

    await ensureOffscreenDocument();

    // The offscreen document owns the only DOMParser instance; the
    // service worker itself has no DOM access under MV3.
    const holdings = await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'PARSE_WORLDCAT_HTML',
      payload: { html, zip, isbn: book.isbn }
    });

    return Array.isArray(holdings) ? holdings : [];
  }

  async _fetchHtml(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) return null;
      return await response.text();
    } catch (err) {
      console.warn('[WorldCatAdapter] fetch failed', err);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
