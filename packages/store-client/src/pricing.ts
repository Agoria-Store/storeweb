import type { Product } from './types.ts';

export function childrenTotal(children: Pick<Product, 'priceUsdt'>[]): number {
  return Math.round(children.reduce((sum, c) => sum + c.priceUsdt, 0) * 100) / 100;
}

/** Whole-number percent saved by buying the parent instead of every child; 0 if no saving. */
export function savingsPercent(
  parent: Pick<Product, 'priceUsdt'>,
  children: Pick<Product, 'priceUsdt'>[],
): number {
  const total = childrenTotal(children);
  if (total <= 0 || parent.priceUsdt >= total) return 0;
  return Math.floor(((total - parent.priceUsdt) / total) * 100);
}

export function formatUsdt(amount: number): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`;
}
