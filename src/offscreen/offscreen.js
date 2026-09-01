/**
 * Offscreen DOM parser for WorldCat search-result pages.
 *
 * Service workers have no DOM access under MV3, so this hidden document
 * exists solely to run DOMParser against HTML the background worker
 * fetched. This file is the extension's DOM-injection/parsing boundary
 * for external data: nothing parsed here is written to storage.
 *
 * WorldCat's markup is not a stable contract -- if the site changes, only
 * SELECTORS below needs updating.
 */
const SELECTORS = {
  resultCard: '[data-testid="briefRecord"], .result, li.briefRecord',
  oclcLink: 'a[href*="/title/"]',
  libraryCount: '[data-testid="held-by-count"], .libraries-count'
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== 'offscreen' || message.type !== 'PARSE_WORLDCAT_HTML') {
    return false;
  }
  const holdings = parseWorldCatHtml(message.payload.html, message.payload.zip);
  sendResponse(holdings);
  return true;
});

/**
 * @param {string} html Raw HTML text from search.worldcat.org
 * @param {string} zip User-supplied ZIP, forwarded only to build outbound links
 * @returns {Array<{libraryName: string, location: string, catalogUrl: string, distance: string}>}
 */
function parseWorldCatHtml(html, zip) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const card = doc.querySelector(SELECTORS.resultCard);
  if (!card) return [];

  const linkEl = card.querySelector(SELECTORS.oclcLink);
  const titleHref = linkEl?.getAttribute('href');
  if (!titleHref) return [];

  const itemUrl = new URL(titleHref, 'https://search.worldcat.org').toString();
  const libraryUrl = zip
    ? `${itemUrl}${itemUrl.includes('?') ? '&' : '?'}library=${encodeURIComponent(zip)}`
    : itemUrl;

  const countText = card.querySelector(SELECTORS.libraryCount)?.textContent?.trim();

  return [
    {
      libraryName: 'WorldCat: Libraries near you',
      location: zip || 'Unknown ZIP',
      catalogUrl: libraryUrl,
      distance: countText || 'Open link to see nearby holdings'
    }
  ];
}
