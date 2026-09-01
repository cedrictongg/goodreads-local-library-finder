# External endpoints

## search.worldcat.org

- **Endpoint**: `https://search.worldcat.org/search?q=bn:<ISBN>`
- **Method**: `GET`, no credentials sent (`credentials: 'omit'`).
- **Why not the official WorldCat Search API**: OCLC ended support for WorldCat Search API v1.0 on 2024-12-31. Its successor (WorldCat Search API v2 / WorldCat Metadata API) requires a paid OCLC WSKey subscription issued to a library, which is not obtainable by an independent open-source extension. That leaves DOM scraping of the same public, signed-out results page a browser receives as the only free, non-deprecated option -- which the project's functional requirements explicitly permit as a fallback.
- **Data sent out**: only the book's ISBN (in the query string) and, when building the outbound link back to WorldCat, the user's ZIP code. Neither value is logged, persisted, or sent anywhere else by this extension.
- **Maintenance note**: the parsing selectors in `src/offscreen/offscreen.js` target WorldCat's current public markup and are not a stable contract. If WorldCat changes its HTML structure, holdings extraction may silently return an empty array; update `SELECTORS` in that file and bump the extension's patch version.

## No other network calls

The extension makes no calls to Goodreads (all Goodreads data comes from the already-loaded page DOM), no analytics/telemetry endpoints, and no other third-party services.
