/**
 * @typedef {Object} BookMetadata
 * @property {string} title
 * @property {string} author
 * @property {string} isbn
 * @property {string} [version]
 * @property {string} [year]
 * @property {string} [genre]
 */

/**
 * @typedef {Object} LibraryHolding
 * @property {string} libraryName
 * @property {string} location
 * @property {string} catalogUrl
 * @property {string} [distance]
 */

/**
 * LibraryAdapter is the contract every data-source adapter must satisfy.
 * Adapters are intentionally side-effect free with respect to storage:
 * they may only read the zip code passed to them and must not write any
 * book or holding data to disk. Results are meant to be cached in memory
 * by the caller (see background/cache.js) for the lifetime of the service
 * worker only. Swap in a new adapter (e.g. a library's own OPAC API) by
 * implementing this class and wiring it in background/service-worker.js.
 */
export class LibraryAdapter {
  /**
   * @param {BookMetadata} book
   * @param {string} zip
   * @returns {Promise<LibraryHolding[]>}
   */
  async findHoldings(book, zip) {
    throw new Error('LibraryAdapter.findHoldings() is abstract and must be overridden');
  }
}
