/**
 * Parses book metadata straight from the Goodreads book-show page DOM.
 * Runs in the content script's isolated world; read-only, never touches
 * chrome.storage and never persists anything it extracts. Selectors are
 * defensive (return null instead of throwing) because Goodreads varies
 * markup by book type, region, and A/B test cohort.
 */
(function (global) {
  'use strict';

  function textOf(selector) {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : null;
  }

  function findIsbn() {
    const rows = document.querySelectorAll('[data-testid="metadataTitle"], .DescListItem, .infoBoxRowItem');
    for (const el of rows) {
      if (/isbn/i.test(el.textContent)) {
        const match = el.textContent.match(/97[89]\d{10}|\d{9}[\dXx]/);
        if (match) return match[0];
      }
    }
    const meta = document.querySelector('meta[property="books:isbn"]');
    return meta?.content?.trim() || null;
  }

  function parseGoodreadsBook() {
    return {
      title: textOf('[data-testid="bookTitle"], h1.Text__title1') || document.title,
      author: textOf('[data-testid="name"], .ContributorLink__name'),
      version: textOf('[data-testid="pagesFormat"]'),
      year: (document.querySelector('[data-testid="publicationInfo"]')?.textContent.match(/\d{4}/) || [])[0] || null,
      genre: textOf('[data-testid="genresList"] a, .BookPageMetadataSection__genres a'),
      isbn: findIsbn()
    };
  }

  global.__GLLF__ = global.__GLLF__ || {};
  global.__GLLF__.parseGoodreadsBook = parseGoodreadsBook;
})(window);
