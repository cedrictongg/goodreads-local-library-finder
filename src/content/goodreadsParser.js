/**
 * Parses book metadata straight from the Goodreads book-show page DOM.
 * Runs in the content script's isolated world; read-only, never touches
 * chrome.storage and never persists anything it extracts. Selectors are
 * defensive (return null instead of throwing) because Goodreads varies
 * markup by book type, region, and A/B test cohort.
 */
(function (global) {
  'use strict';

  function findIsbn() {
    const rows = Array.from(document.querySelectorAll('[data-testid="metadataTitle"], .DescListItem, .infoBoxRowItem'));
    const isbnRow = rows.find((el) => /isbn/i.test(el.textContent));
    if (isbnRow) {
      const match = isbnRow.textContent.match(/97[89]\d{10}|\d{9}[\dXx]/);
      if (match) return match[0];
    }
    const meta = document.querySelector('meta[property="books:isbn"]');
    return meta?.content?.trim() || null;
  }

  function parseGoodreadsBook() {
    return {
      isbn: findIsbn()
    };
  }

  global.__GLLF__ = global.__GLLF__ || {};
  global.__GLLF__.parseGoodreadsBook = parseGoodreadsBook;
})(window);
