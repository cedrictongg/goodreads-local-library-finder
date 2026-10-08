// Session-only, in-memory cache. This Map lives inside the service worker
// and is never written to chrome.storage or disk, so it disappears the
// moment Chrome suspends/evicts the worker (typically after ~30s idle).
// It exists purely to avoid re-fetching WorldCat during a single browsing
// session -- it is NOT persistent storage, satisfying the "data should
// not be stored anywhere" requirement.
const TTL_MS = 5 * 60 * 1000;
export const MAX_CACHE_SIZE = 100;
const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    store.delete(key);
    return null;
  }
  // Refresh recency in Map insertion order for LRU eviction
  store.delete(key);
  store.set(key, entry);
  return entry.value;
}

export function setCached(key, value) {
  if (store.has(key)) {
    store.delete(key);
  } else if (store.size >= MAX_CACHE_SIZE) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) {
      store.delete(oldestKey);
    }
  }
  store.set(key, { value, timestamp: Date.now() });
}

export function cacheKey(isbn, zip) {
  return `${isbn}|${zip}`;
}

export function clearCache() {
  store.clear();
}
