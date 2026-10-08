import { getCached, setCached, cacheKey, clearCache, MAX_CACHE_SIZE } from '../src/background/cache.js';

describe('session cache', () => {
  beforeEach(() => {
    clearCache();
  });

  test('stores and retrieves a value by composite key', () => {
    const key = cacheKey('9780143127550', '91754');
    setCached(key, [{ libraryName: 'Test Library' }]);
    expect(getCached(key)).toEqual([{ libraryName: 'Test Library' }]);
  });

  test('returns null for an unknown key', () => {
    expect(getCached(cacheKey('0000000000', '00000'))).toBeNull();
  });

  test('evicts oldest entry when MAX_CACHE_SIZE limit is exceeded', () => {
    for (let i = 0; i < MAX_CACHE_SIZE; i++) {
      setCached(`key-${i}`, `value-${i}`);
    }

    expect(getCached('key-0')).toBe('value-0');

    // Adding MAX_CACHE_SIZE + 1 entry should evict the oldest item.
    // Note that 'key-0' was recently accessed via getCached('key-0'), so 'key-1' is now the oldest!
    setCached('key-overflow', 'value-overflow');

    expect(getCached('key-1')).toBeNull(); // evicted
    expect(getCached('key-0')).toBe('value-0'); // refreshed recency on getCached, preserved
    expect(getCached('key-overflow')).toBe('value-overflow');
  });

  test('evicts strictly in LRU order upon capacity overflow', () => {
    for (let i = 0; i < MAX_CACHE_SIZE; i++) {
      setCached(`item-${i}`, `val-${i}`);
    }

    // item-0 is oldest. Adding item-new evicts item-0.
    setCached('item-new', 'val-new');
    expect(getCached('item-0')).toBeNull();
    expect(getCached('item-1')).toBe('val-1');
  });

  test('returns null and evicts expired cache entries based on TTL', () => {
    const key = 'ttl-key';
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    setCached(key, 'ttl-value');
    expect(getCached(key)).toBe('ttl-value');

    // Fast forward time past 5 minutes (TTL_MS)
    jest.spyOn(Date, 'now').mockReturnValue(now + 5 * 60 * 1000 + 1000);

    expect(getCached(key)).toBeNull();

    Date.now.mockRestore();
  });
});
