import { getCached, setCached, cacheKey } from '../src/background/cache.js';

describe('session cache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('stores and retrieves a value by composite key', () => {
    const key = cacheKey('9780143127550', '91754');
    setCached(key, [{ libraryName: 'Test Library' }]);
    expect(getCached(key)).toEqual([{ libraryName: 'Test Library' }]);
  });

  test('returns null for an unknown key', () => {
    expect(getCached(cacheKey('0000000000', '00000'))).toBeNull();
  });

  test('returns value before TTL expires and returns null after TTL expires', () => {
    const key = cacheKey('9780143127550', '91754');

    setCached(key, [{ libraryName: 'Test Library' }]);

    // Advance time by 4 minutes (before TTL)
    jest.advanceTimersByTime(4 * 60 * 1000);
    expect(getCached(key)).toEqual([{ libraryName: 'Test Library' }]);

    // Advance time past TTL (more than 5 minutes total from setting)
    jest.advanceTimersByTime(1 * 60 * 1000 + 1);
    expect(getCached(key)).toBeNull();

    // Verify key was removed from cache upon expiration check
    expect(getCached(key)).toBeNull();
  });
});
