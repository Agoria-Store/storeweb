import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { MockStore } from './mock-store.ts';
import type { StoreClient } from './types.ts';

export * from './types.ts';
export * from './pricing.ts';
export { MockStore } from './mock-store.ts';

/** Walks up from cwd to find data/products.json (works from any workspace package, bundled or not). */
function findCatalog(from = process.cwd()): string {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, 'data', 'products.json');
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir)
      throw new Error('data/products.json not found; set MOCK_CATALOG_PATH');
  }
}

export async function createStoreClient(
  env: { STORE_PROVIDER?: string; MOCK_CATALOG_PATH?: string } = {},
): Promise<StoreClient> {
  const provider = env.STORE_PROVIDER ?? 'mock';
  switch (provider) {
    case 'mock':
      return MockStore.fromFile(env.MOCK_CATALOG_PATH ?? findCatalog());
    default:
      throw new Error(`Unknown STORE_PROVIDER "${provider}"`);
  }
}
