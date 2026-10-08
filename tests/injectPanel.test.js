/**
 * Unit test for injectPanel.js renderError security fix
 */

function createMockElement(tagName = 'div') {
  const children = [];
  return {
    tagName: tagName.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    innerHTML: '',
    children,
    shadowRoot: null,
    attachShadow({ mode }) {
      const shadow = createMockElement('shadow-root');
      shadow.mode = mode;
      this.shadowRoot = shadow;
      return shadow;
    },
    appendChild(child) {
      children.push(child);
      return child;
    },
    prepend(child) {
      children.unshift(child);
      return child;
    },
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.gllf-card') {
        return children.filter((c) => c.className === 'gllf-card');
      }
      return [];
    },
    remove() {
      // noop
    },
  };
}

describe('injectPanel renderError security', () => {
  let mockHost;
  let mockShadow;
  let mockBody;

  beforeEach(() => {
    mockShadow = createMockElement('shadow-root');
    mockHost = createMockElement('div');
    mockHost.id = 'gllf-panel-host';
    mockHost.shadowRoot = mockShadow;

    mockBody = createMockElement('body');

    global.window = global;
    global.document = {
      getElementById: (id) => (id === 'gllf-panel-host' ? mockHost : null),
      createElement: (tag) => createMockElement(tag),
      querySelector: () => null,
      body: mockBody,
    };

    // Require the module
    require('../src/content/injectPanel.js');
  });

  test('renderError sets textContent instead of innerHTML for message', () => {
    const maliciousInput = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    global.__GLLF__.renderError(maliciousInput);

    const cards = mockShadow.children.filter((c) => c.className === 'gllf-card');
    expect(cards.length).toBe(1);

    const card = cards[0];
    expect(card.children.length).toBe(2);

    const titleEl = card.children[0];
    expect(titleEl.className).toBe('gllf-title');
    expect(titleEl.textContent).toBe('Library lookup unavailable');

    const messageEl = card.children[1];
    expect(messageEl.className).toBe('gllf-muted');
    expect(messageEl.textContent).toBe(maliciousInput);
    expect(messageEl.innerHTML).toBe('');
  });
});
