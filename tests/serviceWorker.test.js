// Define global chrome before requiring modules
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  }
};

const { handleLookup } = require('../src/background/service-worker.js');
const { WorldCatAdapter } = require('../src/adapters/worldcatAdapter.js');

describe('handleLookup missing inputs', () => {
  test('returns missing_zip when called with no arguments', async () => {
    const result = await handleLookup();
    expect(result).toEqual({ error: 'missing_zip' });
  });

  test('returns missing_zip when called with an empty object', async () => {
    const result = await handleLookup({});
    expect(result).toEqual({ error: 'missing_zip' });
  });

  test('returns missing_zip when zip is missing but book is provided', async () => {
    const result = await handleLookup({ book: { isbn: '1234567890' } });
    expect(result).toEqual({ error: 'missing_zip' });
  });

  test('returns missing_isbn when zip is provided but book is missing', async () => {
    const result = await handleLookup({ zip: '91754' });
    expect(result).toEqual({ error: 'missing_isbn' });
  });

  test('returns missing_isbn when zip is provided but book object is empty', async () => {
    const result = await handleLookup({ zip: '91754', book: {} });
    expect(result).toEqual({ error: 'missing_isbn' });
  });

  test('returns missing_isbn when zip is provided but book.isbn is undefined or empty', async () => {
    const result = await handleLookup({ zip: '91754', book: { isbn: '' } });
    expect(result).toEqual({ error: 'missing_isbn' });
  });
});

describe('handleLookup valid inputs and cache', () => {
  test('fetches holdings from adapter when not cached, and returns cached holdings on second lookup', async () => {
    const mockHoldings = [{ libraryName: 'Main Branch', distance: '1.2 mi' }];
    const spy = jest
      .spyOn(WorldCatAdapter.prototype, 'findHoldings')
      .mockResolvedValue(mockHoldings);

    const book = { isbn: '9780143127550' };
    const zip = '91754';

    // First call - cache miss
    const res1 = await handleLookup({ book, zip });
    expect(res1).toEqual({ holdings: mockHoldings, fromCache: false });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(book, zip);

    // Second call - cache hit
    const res2 = await handleLookup({ book, zip });
    expect(res2).toEqual({ holdings: mockHoldings, fromCache: true });
    expect(spy).toHaveBeenCalledTimes(1); // Should not call adapter again

    spy.mockRestore();
  });
});
