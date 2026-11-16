import { readFile } from 'node:fs/promises';
import type { CatalogData, Order, Product, ProductFilter, StoreClient } from './types.ts';

export class MockStore implements StoreClient {
  constructor(private readonly data: CatalogData) {}

  static async fromFile(path: string | URL): Promise<MockStore> {
    return new MockStore(JSON.parse(await readFile(path, 'utf8')) as CatalogData);
  }

  async listProducts(filter: ProductFilter = {}): Promise<Product[]> {
    return this.data.products
      .filter((p) => p.active)
      .filter((p) => !filter.type || p.type === filter.type)
      .filter((p) => !filter.parentId || p.parentId === filter.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getProduct(idOrSlug: string): Promise<Product | null> {
    return (
      this.data.products.find((p) => p.active && (p.id === idOrSlug || p.slug === idOrSlug)) ?? null
    );
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.data.orders?.find((o) => o.id === orderId) ?? null;
  }
}
