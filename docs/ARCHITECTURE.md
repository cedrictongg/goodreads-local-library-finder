# Architecture

## Data flow

```
Goodreads page DOM
   |  (read-only, content script isolated world)
   v
src/content/goodreadsParser.js  --parses--> { title, author, version, year, genre, isbn }
   |
   v
src/content/content-script.js  --chrome.runtime.sendMessage--> src/background/service-worker.js
   |                                                                 |
   |                                                                 v
   |                                                     src/background/cache.js (in-memory, 5 min TTL)
   |                                                                 |  (miss)
   |                                                                 v
   |                                                     src/adapters/worldcatAdapter.js
   |                                                                 |  fetch(search.worldcat.org)
   |                                                                 v
   |                                                     src/offscreen/offscreen.js (DOMParser)
   |                                                                 |
   v                                                                 v
src/content/injectPanel.js  <--holdings[]-- chrome.runtime.sendMessage response
   |
   v
Closed shadow-DOM panel rendered on the Goodreads page
```

## Why an offscreen document

Manifest V3 service workers have no `window`, `document`, or `DOMParser`. The `chrome.offscreen` API (Chrome 109+) lets an extension spin up a hidden, single-purpose HTML page that does have DOM access. `worldcatAdapter.js` fetches raw HTML in the service worker (which has `fetch`), then hands that HTML to `offscreen.js` for parsing via `chrome.runtime.sendMessage`. This keeps the actual DOM-parsing logic auditable in one file and out of the page contexts the extension does not control.

## The adapter interface

`src/adapters/libraryAdapter.js` defines a single abstract method, `findHoldings(book, zip)`, that returns an array of `LibraryHolding` objects. `WorldCatAdapter` is the only concrete implementation shipped today, but any library system with its own OPAC API (Koha, SirsiDynix, Evergreen, etc.) can be added as a new class implementing the same contract. Swapping adapters means changing one line in `src/background/service-worker.js`; no changes to content scripts, caching, or UI are required.

## The DOM-injection boundary

`src/content/injectPanel.js` creates a single host element and attaches a **closed** shadow root to it before rendering anything. A closed shadow root cannot be reached by `element.shadowRoot` from Goodreads' own scripts, so the extension's markup, styles, and injected links are isolated from the host page in both directions. This is the extension's explicit DOM-injection boundary called out in the project's open-source constraints.

## Caching, not storage

`src/background/cache.js` holds a plain `Map` scoped to the service worker's lifetime, with a five-minute TTL per entry. It is not `chrome.storage`, IndexedDB, or any disk-backed API -- Chrome routinely terminates idle service workers (typically after ~30 seconds of inactivity), which clears the cache automatically. This satisfies the requirement that book and library data never be persisted, while still avoiding redundant WorldCat requests within a single active session.

## Responsiveness

Every injected/rendered surface (the shadow-DOM panel, the popup, and the options page) uses relative widths, `flex-wrap`, and a single `max-width: 480px` media query breakpoint rather than fixed pixel layouts, so the UI adapts across phone-width Goodreads views, browser side panels, and full desktop windows.
