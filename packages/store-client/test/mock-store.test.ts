import { describe, expect, it } from 'vitest';
import { createStoreClient, MockStore, savingsPercent, childrenTotal } from '../src/index.ts';
import type { CatalogData, Product } from '../src/types.ts';

const base: Omit<Product, 'id' | 'slug' | 'type' | 'sortOrder'> = {
  title: 't',
  description: 'd',
  owner: 'me',
  priceUsdt: 10,
  checkoutUrl: 'https://example.com',
  delivery: 'download',
  active: true,
};

const fixture: CatalogData = {
  products: [
    { ...base, id: 'c2', slug: 'c-two', type: 'course', sortOrder: 2 },
    { ...base, id: 'c1', slug: 'c-one', type: 'course', sortOrder: 1 },
    { ...base, id: 'ch1', slug: 'ch-one', type: 'chapter', parentId: 'c1', sortOrder: 3 },
    { ...base, id: 'off', slug: 'off', type: 'course', sortOrder: 0, active: false },
  ],
  orders: [{ id: 'o1', productId: 'c1', status: 'paid' }],
};

describe('MockStore', () => {
  const store = new MockStore(fixture);

  it('lists active products sorted by sortOrder', async () => {
    expect((await store.listProducts()).map((p) => p.id)).toEqual(['c1', 'c2', 'ch1']);
  });

  it('filters by type and parentId', async () => {
    expect((await store.listProducts({ type: 'course' })).map((p) => p.id)).toEqual(['c1', 'c2']);
    expect((await store.listProducts({ parentId: 'c1' })).map((p) => p.id)).toEqual(['ch1']);
  });

  it('gets by id or slug, null on miss or inactive', async () => {
    expect((await store.getProduct('c1'))?.id).toBe('c1');
    expect((await store.getProduct('c-two'))?.id).toBe('c2');
    expect(await store.getProduct('nope')).toBeNull();
    expect(await store.getProduct('off')).toBeNull();
  });

  it('gets orders', async () => {
    expect(await store.getOrder('o1')).toEqual({ id: 'o1', productId: 'c1', status: 'paid' });
    expect(await store.getOrder('o2')).toBeNull();
  });
});

describe('pricing', () => {
  it('computes savings', () => {
    const kids = [{ priceUsdt: 29 }, { priceUsdt: 29 }, { priceUsdt: 29 }];
    expect(childrenTotal(kids)).toBe(87);
    expect(savingsPercent({ priceUsdt: 49 }, kids)).toBe(43);
  });

  it('returns 0 when there is no saving', () => {
    expect(savingsPercent({ priceUsdt: 100 }, [{ priceUsdt: 50 }])).toBe(0);
    expect(savingsPercent({ priceUsdt: 10 }, [])).toBe(0);
  });
});

describe('data/products.json', async () => {
  const store = await createStoreClient();
  const all = await store.listProducts();
  const ids = new Set(all.map((p) => p.id));

  it('has 2 courses with 3 chapters each', async () => {
    const courses = await store.listProducts({ type: 'course' });
    expect(courses).toHaveLength(2);
    for (const c of courses) {
      expect(await store.listProducts({ parentId: c.id })).toHaveLength(3);
    }
  });

  it('prices chapters at 1.5–2x the full course', async () => {
    for (const c of await store.listProducts({ type: 'course' })) {
      const ratio = childrenTotal(await store.listProducts({ parentId: c.id })) / c.priceUsdt;
      expect(ratio).toBeGreaterThanOrEqual(1.5);
      expect(ratio).toBeLessThanOrEqual(2);
    }
  });

  it('has valid references and delivery config', () => {
    for (const p of all) {
      if (p.parentId) expect(ids.has(p.parentId)).toBe(true);
      for (const inc of p.includes ?? []) expect(ids.has(inc)).toBe(true);
      if (p.delivery === 'telegram_channel') expect(p.telegramChannelId).toBeTruthy();
      expect(p.checkoutUrl).toMatch(/^https:\/\//);
    }
    expect(all.some((p) => p.delivery === 'telegram_channel')).toBe(true);
    expect(new Set(all.map((p) => p.slug)).size).toBe(all.length);
  });
});
