describe('parseGoodreadsBook', () => {
  let originalDocument;
  let originalWindow;

  beforeEach(() => {
    jest.resetModules();
    originalDocument = global.document;
    originalWindow = global.window;
    global.window = global;
  });

  afterEach(() => {
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.__GLLF__;
  });

  test('extracts ISBN from metadata row', () => {
    global.document = {
      querySelectorAll: (selector) => {
        if (selector.includes('[data-testid="metadataTitle"]')) {
          return [{ textContent: 'ISBN: 9780140449136' }];
        }
        return [];
      },
      querySelector: () => null
    };

    require('../src/content/goodreadsParser.js');

    const book = global.__GLLF__.parseGoodreadsBook();
    expect(book).toEqual({ isbn: '9780140449136' });
  });

  test('extracts ISBN from meta tag if row is missing', () => {
    global.document = {
      querySelectorAll: () => [],
      querySelector: (selector) => {
        if (selector === 'meta[property="books:isbn"]') {
          return { content: '0140449132' };
        }
        return null;
      }
    };

    require('../src/content/goodreadsParser.js');

    const book = global.__GLLF__.parseGoodreadsBook();
    expect(book).toEqual({ isbn: '0140449132' });
  });

  test('returns null isbn when no ISBN is found', () => {
    global.document = {
      querySelectorAll: () => [],
      querySelector: () => null
    };

    require('../src/content/goodreadsParser.js');

    const book = global.__GLLF__.parseGoodreadsBook();
    expect(book).toEqual({ isbn: null });
  });
});
