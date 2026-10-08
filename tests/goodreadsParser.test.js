/**
 * Custom minimal DOM simulation for testing goodreadsParser in node testEnvironment
 */

describe('goodreadsParser', () => {
  let mockElements = [];
  let metaElements = [];

  beforeEach(() => {
    mockElements = [];
    metaElements = [];

    const mockWindow = {};
    global.window = mockWindow;
    global.document = {
      title: 'Default Title',
      querySelector: (selector) => {
        if (selector === 'meta[property="books:isbn"]') {
          return metaElements.find((m) => m.attributes.property === 'books:isbn') || null;
        }
        if (selector.includes('bookTitle')) {
          return mockElements.find((e) => e.attributes && e.attributes['data-testid'] === 'bookTitle') || null;
        }
        if (selector.includes('name')) {
          return mockElements.find((e) => e.attributes && e.attributes['data-testid'] === 'name') || null;
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector.includes('metadataTitle') || selector.includes('DescListItem') || selector.includes('infoBoxRowItem')) {
          return mockElements.filter((e) =>
            (e.attributes && e.attributes['data-testid'] === 'metadataTitle') ||
            e.className === 'DescListItem' ||
            e.className === 'infoBoxRowItem'
          );
        }
        return [];
      }
    };

    // Evaluate script with window in global context
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.join(__dirname, '../src/content/goodreadsParser.js'), 'utf8');
    eval(code);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  test('extracts ISBN from metadata row elements', () => {
    mockElements.push({
      attributes: { 'data-testid': 'bookTitle' },
      className: '',
      textContent: 'The Great Gatsby'
    });
    mockElements.push({
      attributes: { 'data-testid': 'name' },
      className: '',
      textContent: 'F. Scott Fitzgerald'
    });
    mockElements.push({
      attributes: {},
      className: 'DescListItem',
      textContent: 'ISBN: 9780743273565'
    });

    const book = global.window.__GLLF__.parseGoodreadsBook();
    expect(book.title).toBe('The Great Gatsby');
    expect(book.author).toBe('F. Scott Fitzgerald');
    expect(book.isbn).toBe('9780743273565');
  });

  test('falls back to meta tag when no ISBN row is present', () => {
    mockElements.push({
      attributes: { 'data-testid': 'bookTitle' },
      className: '',
      textContent: 'The Great Gatsby'
    });
    metaElements.push({
      attributes: { property: 'books:isbn' },
      content: '9780743273565'
    });

    const book = global.window.__GLLF__.parseGoodreadsBook();
    expect(book.isbn).toBe('9780743273565');
  });

  test('returns null isbn when neither element nor meta tag exists', () => {
    mockElements.push({
      attributes: { 'data-testid': 'bookTitle' },
      className: '',
      textContent: 'Unknown Book'
    });

    const book = global.window.__GLLF__.parseGoodreadsBook();
    expect(book.isbn).toBeNull();
  });
});
