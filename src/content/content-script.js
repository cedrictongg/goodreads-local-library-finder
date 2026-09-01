/**
 * Orchestrator for the content-script world: reads the user's stored ZIP
 * (config only -- never book data), parses the current Goodreads page,
 * and asks the background service worker to resolve library holdings.
 * All network access happens in the background context, so this file
 * never needs host permissions of its own.
 */
(function () {
  'use strict';

  const { parseGoodreadsBook, renderLoading, renderHoldings, renderError } = window.__GLLF__;

  async function getZip() {
    const { zip } = await chrome.storage.local.get('zip');
    return zip || null;
  }

  async function run() {
    const zip = await getZip();
    if (!zip) {
      renderError('Set your ZIP code in the extension popup to enable library lookups.');
      return;
    }

    const book = parseGoodreadsBook();
    if (!book.isbn) {
      renderError('Could not read an ISBN from this Goodreads page.');
      return;
    }

    renderLoading();

    chrome.runtime.sendMessage(
      { type: 'FIND_LIBRARY_HOLDINGS', payload: { book, zip } },
      (response) => {
        if (chrome.runtime.lastError) {
          renderError('Extension messaging error. Reload the page and try again.');
          return;
        }
        if (response?.error) {
          renderError(`Lookup failed (${response.error}).`);
          return;
        }
        renderHoldings(response.holdings, zip);
      }
    );
  }

  run();
})();
