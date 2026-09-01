import { getCached, setCached, cacheKey } from '../src/background/cache.js';

describe('session cache', () => {
  test('stores and retrieves a value by composite key', () => {
    const key = cacheKey('9780143127550', '91754');
    setCached(key, [{ libraryName: 'Test Library' }]);
    expect(getCached(key)).toEqual([{ libraryName: 'Test Library' }]);
  });

  test('returns null for an unknown key', () => {
    expect(getCached(cacheKey('0000000000', '00000'))).toBeNull();
  });
});
