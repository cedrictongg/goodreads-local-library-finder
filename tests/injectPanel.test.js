/**
 * @jest-environment jsdom
 */

describe('injectPanel DOM rendering', () => {
  let createdShadowRoot;

  beforeEach(() => {
    document.body.innerHTML = '<div id="metacol"></div>';
    createdShadowRoot = null;

    const originalAttachShadow = Element.prototype.attachShadow;
    jest.spyOn(Element.prototype, 'attachShadow').mockImplementation(function (options) {
      const sr = originalAttachShadow.call(this, options);
      createdShadowRoot = sr;
      return sr;
    });

    // Re-require injectPanel so window.__GLLF__ is set up
    jest.isolateModules(() => {
      require('../src/content/injectPanel.js');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renderLoading creates expected DOM elements', () => {
    window.__GLLF__.renderLoading();

    expect(createdShadowRoot).not.toBeNull();
    const card = createdShadowRoot.querySelector('.gllf-card');
    expect(card).not.toBeNull();

    const title = card.querySelector('.gllf-title');
    expect(title.textContent).toBe('Checking local library availability\u2026');
  });

  test('renderHoldings safely renders holdings and mitigates XSS', () => {
    const xssPayloadName = '<img src=x onerror="alert(1)"> Test Library';
    const xssPayloadZip = '<script>alert(2)</script>90210';
    const xssPayloadDist = '<b onmouseover="alert(3)">1.2 miles</b>';
    const catalogUrl = 'https://example.com/catalog?q=test';

    const holdings = [
      {
        libraryName: xssPayloadName,
        catalogUrl: catalogUrl,
        distance: xssPayloadDist,
      },
    ];

    window.__GLLF__.renderHoldings(holdings, xssPayloadZip);

    expect(createdShadowRoot).not.toBeNull();
    const title = createdShadowRoot.querySelector('.gllf-title');
    expect(title.textContent).toBe(`Library availability near ${xssPayloadZip}`);
    expect(title.querySelector('script')).toBeNull();

    const link = createdShadowRoot.querySelector('.gllf-link');
    expect(link.textContent).toBe(xssPayloadName);
    expect(link.href).toBe(catalogUrl);
    expect(link.querySelector('img')).toBeNull();

    const span = createdShadowRoot.querySelector('.gllf-muted');
    expect(span.textContent).toBe(xssPayloadDist);
    expect(span.querySelector('b')).toBeNull();
  });

  test('renderHoldings with empty holdings shows fallback message', () => {
    window.__GLLF__.renderHoldings([], '90210');

    expect(createdShadowRoot).not.toBeNull();
    const title = createdShadowRoot.querySelector('.gllf-title');
    expect(title.textContent).toBe('No local library match found');
  });

  test('renderError safely renders error message', () => {
    const xssErrorMessage = '<svg onload=alert(1)>Lookup failed';
    window.__GLLF__.renderError(xssErrorMessage);

    expect(createdShadowRoot).not.toBeNull();
    const title = createdShadowRoot.querySelector('.gllf-title');
    expect(title.textContent).toBe('Library lookup unavailable');

    const muted = createdShadowRoot.querySelector('.gllf-muted');
    expect(muted.textContent).toBe(xssErrorMessage);
    expect(muted.querySelector('svg')).toBeNull();
  });
});
