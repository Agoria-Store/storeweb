import { savingsPercent, childrenTotal, type Product } from '@course-store/store-client';
import { store } from './store';

export type Listed = Product & { childCount: number; savings: number; partsTotal: number };

/** Parts of a product: children by parentId, or included products for a bundle. */
export async function partsOf(p: Product): Promise<Product[]> {
  const s = await store();
  if (p.includes?.length) {
    const items = await Promise.all(p.includes.map((id) => s.getProduct(id)));
    return items.filter((x): x is Product => !!x);
  }
  return s.listProducts({ parentId: p.id });
}

export async function withSavings(p: Product): Promise<Listed> {
  const parts = await partsOf(p);
  return {
    ...p,
    childCount: parts.length,
    savings: savingsPercent(p, parts),
    partsTotal: childrenTotal(parts),
  };
}

/** Products that get their own detail page (anything that has parts). */
export const hasDetailPage = (p: Product) => !p.parentId;

/** Pages are routed by slug, so a child links to its parent's slug, never its id. */
export async function productHref(p: Product): Promise<string> {
  if (!p.parentId) return `/p/${p.slug}/`;
  const parent = await (await store()).getProduct(p.parentId);
  return `/p/${parent?.slug ?? p.parentId}/#${p.slug}`;
}

export const TYPE_LABEL: Record<Product['type'], string> = {
  course: 'Course',
  chapter: 'Chapter',
  video: 'Video',
  ebook: 'E-book',
  template: 'Template',
  bundle: 'Bundle',
};
