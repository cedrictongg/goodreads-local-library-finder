/**
 * Renders the library-availability panel inside a CLOSED shadow root.
 * This is the extension's DOM-injection boundary: Goodreads' own styles
 * and scripts cannot read or mutate anything inside the shadow tree, and
 * our code cannot be scraped or altered by the host page either. Only
 * rendering happens here -- nothing is written to disk, chrome.storage,
 * or any external endpoint from this file.
 */
(function (global) {
  'use strict';

  const HOST_ID = 'gllf-panel-host';

  function ensureHost() {
    let host = document.getElementById(HOST_ID);
    if (host && host.shadowRoot) return host.shadowRoot;

    host = document.createElement('div');
    host.id = HOST_ID;
    const anchor = document.querySelector('[data-testid="BookPageMetadataSection"], .BookPageMetadataSection, #metacol') || document.body;
    anchor.prepend(host);

    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    // Responsive by design: flex-wrap + a narrow-viewport media query keep
    // the panel usable from phone-width Goodreads views up to desktop.
    style.textContent = `
      :host { display: block; width: 100%; box-sizing: border-box; margin: 12px 0; }
      .gllf-card { font-family: inherit; border: 1px solid #d8d8d8; border-radius: 8px;
        padding: 12px 16px; box-sizing: border-box; }
      .gllf-title { font-weight: 600; margin-bottom: 6px; }
      .gllf-row { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 4px 0; }
      .gllf-link { color: #1a73e8; text-decoration: none; }
      .gllf-link:hover { text-decoration: underline; }
      .gllf-muted { color: #666; font-size: 0.85em; }
      @media (max-width: 480px) { .gllf-row { flex-direction: column; } }
    `;
    shadow.appendChild(style);
    return shadow;
  }

  function clearCards(shadow) {
    shadow.querySelectorAll('.gllf-card').forEach((n) => n.remove());
  }

  function renderLoading() {
    const shadow = ensureHost();
    clearCards(shadow);
    const card = document.createElement('div');
    card.className = 'gllf-card';

    const title = document.createElement('div');
    title.className = 'gllf-title';
    title.textContent = 'Checking local library availability\u2026';

    card.appendChild(title);
    shadow.appendChild(card);
  }

  function renderHoldings(holdings, zip) {
    const shadow = ensureHost();
    clearCards(shadow);
    const card = document.createElement('div');
    card.className = 'gllf-card';

    if (!holdings || holdings.length === 0) {
      const title = document.createElement('div');
      title.className = 'gllf-title';
      title.textContent = 'No local library match found';

      const muted = document.createElement('div');
      muted.className = 'gllf-muted';
      muted.textContent = 'Try a different ZIP code in the extension popup.';

      card.appendChild(title);
      card.appendChild(muted);
      shadow.appendChild(card);
      return;
    }

    const title = document.createElement('div');
    title.className = 'gllf-title';
    title.textContent = `Library availability near ${zip}`;
    card.appendChild(title);

    holdings.forEach((h) => {
      const row = document.createElement('div');
      row.className = 'gllf-row';

      const link = document.createElement('a');
      link.className = 'gllf-link';
      link.href = h.catalogUrl || '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = h.libraryName || '';

      const span = document.createElement('span');
      span.className = 'gllf-muted';
      span.textContent = h.distance || '';

      row.appendChild(link);
      row.appendChild(span);
      card.appendChild(row);
    });

    shadow.appendChild(card);
  }

  function renderError(message) {
    const shadow = ensureHost();
    clearCards(shadow);
    const card = document.createElement('div');
    card.className = 'gllf-card';

    const title = document.createElement('div');
    title.className = 'gllf-title';
    title.textContent = 'Library lookup unavailable';

    const muted = document.createElement('div');
    muted.className = 'gllf-muted';
    muted.textContent = message || '';

    card.appendChild(title);
    card.appendChild(muted);
    shadow.appendChild(card);
  }

  global.__GLLF__ = global.__GLLF__ || {};
  Object.assign(global.__GLLF__, { renderLoading, renderHoldings, renderError });
})(window);
