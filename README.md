# Goodreads Local Library Finder

A lightweight Chrome (Manifest V3) extension that injects local library availability directly into Goodreads book pages, so you can see whether a book is available at a nearby library without leaving the page.

## Features

- Reads author, title, format/version, year published, genre, and ISBN straight from the Goodreads book page DOM.
- Looks up the ISBN against WorldCat and injects a library-availability card into the page, linked back to the library's own catalog page.
- Scopes results to a ZIP code you enter once in the extension's options page.
- Manifest V3 only, no remotely hosted code, minimal permissions, and no persistent storage of book or library data.
- Responsive layout: the injected panel and the options/popup pages adapt from phone-width to desktop.

## Why WorldCat instead of a library API

OCLC retired WorldCat Search API v1.0 on 2024-12-31, and v2 requires a paid OCLC WSKey subscription that isn't available to an open-source, no-backend browser extension. Per the project's own requirement to "scrape the information from the DOM or find a non-deprecated API," this extension fetches the public, signed-out WorldCat search results page and parses it in an isolated offscreen document. See [docs/EXTERNAL_ENDPOINTS.md](docs/EXTERNAL_ENDPOINTS.md) for details and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full data flow.

## Install (unpacked, for development)

1. Clone this repository.
2. Run `npm install` to pull dev dependencies (lint/test only -- the extension itself ships with zero runtime dependencies).
3. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**, pointing at the repository root.
4. Open the extension's popup and click **Open settings** to enter your ZIP code.
5. Visit any `https://www.goodreads.com/book/show/...` page.

## Project layout

```
manifest.json                 Manifest V3 entry point
src/adapters/                 LibraryAdapter interface + WorldCat implementation
src/background/               Service worker, in-memory cache, offscreen-document manager
src/offscreen/                 Hidden document that runs DOMParser (service workers have no DOM)
src/content/                  Goodreads DOM parser, shadow-DOM panel injector, orchestrator
src/popup/, src/options/       Toolbar popup and ZIP-code settings page
src/utils/                     Pure, unit-tested helpers (ZIP validation)
tests/                          Jest unit tests
docs/                          Architecture, permissions, and external-endpoint documentation
```

## Data handling

No book metadata or library holdings are ever written to disk. The only persisted value is the user's ZIP code, stored in `chrome.storage.local` purely to scope searches. Lookup results live only in an in-memory `Map` inside the service worker for a five-minute session cache, which disappears whenever Chrome evicts the idle service worker.

## Development

```
npm test    # run Jest unit tests
npm run lint
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions and the pull-request checklist.

## License

MIT -- see [LICENSE](LICENSE).
