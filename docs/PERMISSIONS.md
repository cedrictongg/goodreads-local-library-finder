# Permissions

| Permission | Why it's requested |
| --- | --- |
| `storage` | Persist only the user's ZIP code in `chrome.storage.local`. No book or library data is ever written here. |
| `offscreen` | Create a hidden document with DOM access so `DOMParser` can run outside the DOM-less service worker (see docs/ARCHITECTURE.md). |
| Host permission: `https://search.worldcat.org/*` | The only external origin the extension fetches from, to retrieve public search-result HTML for ISBN lookups. |

## What is deliberately *not* requested

- No `activeTab` or `https://www.goodreads.com/*` host permission: the content script's declarative `matches` entry in `manifest.json` is sufficient to run read-only DOM parsing and shadow-DOM injection on Goodreads book pages, without granting the extension general host access.
- No `<all_urls>` or wildcard host permissions.
- No remotely hosted or eval'd code, per Manifest V3's removal of remote code execution.
