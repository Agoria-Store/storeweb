import type { Product } from '@course-store/store-client';
import { store } from './store';

export type Art = 'candles' | 'network' | 'wave' | 'layers';

const COURSE_ART: Art[] = ['candles', 'network', 'wave'];

/** Picks each product's illustration: courses cycle through scenes, bundles stack, children inherit their parent's scene with a number. */
export async function artFor(p: Product): Promise<{ art: Art; number?: number }> {
  const s = await store();
  if (p.type === 'bundle') return { art: 'layers' };
  const courses = await s.listProducts({ type: 'course' });
  const courseIndex = (id: string) =>
    Math.max(
      0,
      courses.findIndex((c) => c.id === id),
    );
  if (!p.parentId) return { art: COURSE_ART[courseIndex(p.id) % COURSE_ART.length]! };
  const siblings = await s.listProducts({ parentId: p.parentId });
  return {
    art: COURSE_ART[courseIndex(p.parentId) % COURSE_ART.length]!,
    number: siblings.findIndex((c) => c.id === p.id) + 1,
  };
}
