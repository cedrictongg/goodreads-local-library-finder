const OFFSCREEN_PATH = 'src/offscreen/offscreen.html';

/**
 * Lazily creates the single offscreen document used for DOM parsing.
 * Chrome only allows one offscreen document per extension at a time, so
 * we check for an existing context before creating a new one.
 */
export async function ensureOffscreenDocument() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  if (existing && existing.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: ['DOM_PARSER'],
    justification: 'Parse WorldCat search-result HTML to extract library holdings; service workers lack DOM access.'
  });
}
