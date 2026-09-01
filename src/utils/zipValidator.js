/**
 * Validates US ZIP codes (5-digit, optionally ZIP+4). Kept separate from
 * options.js so it is independently unit-testable without touching any
 * chrome.* API.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidUsZip(value) {
  return /^\d{5}(-\d{4})?$/.test(String(value).trim());
}
