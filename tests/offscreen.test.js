import { parseWorldCatHtml } from '../src/offscreen/offscreen.js';

class MockElement {
  constructor(tag, attrs = {}, textContent = '', children = []) {
    this.tag = tag;
    this.attrs = attrs;
    this.textContent = textContent;
    this.children = children;
  }

  getAttribute(attr) {
    return this.attrs[attr] || null;
  }

  querySelector(selector) {
    if (selector.includes('briefRecord') || selector.includes('result')) {
      return this.children.find(c => c.attrs['data-testid'] === 'briefRecord' || c.attrs.class === 'result') || null;
    }
    if (selector.includes('/title/')) {
      return this.children.find(c => c.tag === 'a' && c.attrs.href && c.attrs.href.includes('/title/')) || null;
    }
    if (selector.includes('held-by-count') || selector.includes('libraries-count')) {
      return this.children.find(c => c.attrs['data-testid'] === 'held-by-count' || c.attrs.class === 'libraries-count') || null;
    }
    return null;
  }
}

class MockDocument {
  constructor(html) {
    this.html = html;
  }

  querySelector() {
    if (!this.html || (!this.html.includes('briefRecord') && !this.html.includes('class="result"'))) {
      return null;
    }
    const children = [];
    if (this.html.includes('/title/12345')) {
      children.push(new MockElement('a', { href: '/title/12345' }));
    }
    if (this.html.includes('10 libraries')) {
      children.push(new MockElement('span', { class: 'libraries-count' }, '10 libraries'));
    }
    return new MockElement('div', { class: 'result' }, '', children);
  }
}

class MockDOMParser {
  parseFromString(html) {
    return new MockDocument(html);
  }
}

beforeAll(() => {
  global.DOMParser = MockDOMParser;
});

describe('parseWorldCatHtml', () => {
  test('returns empty array when HTML has no result card', () => {
    const holdings = parseWorldCatHtml('<div>No results</div>', '91754');
    expect(holdings).toEqual([]);
  });

  test('parses valid result card with ZIP code', () => {
    const sampleHtml = '<div class="result"><a href="/title/12345">Book</a><span class="libraries-count">10 libraries</span></div>';
    const holdings = parseWorldCatHtml(sampleHtml, '91754');
    expect(holdings).toEqual([
      {
        libraryName: 'WorldCat: Libraries near you',
        location: '91754',
        catalogUrl: 'https://search.worldcat.org/title/12345?library=91754',
        distance: '10 libraries'
      }
    ]);
  });

  test('parses valid result card without ZIP code', () => {
    const sampleHtml = '<div class="result"><a href="/title/12345">Book</a><span class="libraries-count">10 libraries</span></div>';
    const holdings = parseWorldCatHtml(sampleHtml, '');
    expect(holdings).toEqual([
      {
        libraryName: 'WorldCat: Libraries near you',
        location: 'Unknown ZIP',
        catalogUrl: 'https://search.worldcat.org/title/12345',
        distance: '10 libraries'
      }
    ]);
  });
});
