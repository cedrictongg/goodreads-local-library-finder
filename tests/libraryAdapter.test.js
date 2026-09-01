import { LibraryAdapter } from '../src/adapters/libraryAdapter.js';

describe('LibraryAdapter base contract', () => {
  test('throws when findHoldings is not overridden', async () => {
    const adapter = new LibraryAdapter();
    await expect(adapter.findHoldings({}, '91754')).rejects.toThrow();
  });
});
