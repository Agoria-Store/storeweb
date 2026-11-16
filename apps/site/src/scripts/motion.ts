import { finePointer, prefersReducedMotion } from './env';
import type Lenis from 'lenis';

export type Motion = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  lenis: Lenis;
};

/** Smooth scroll + ScrollTrigger, desktop pointers only (pinning is desktop-only). Content is visible without it. */
export function initMotion() {
  if (prefersReducedMotion() || !finePointer()) return;
  const start = () => void load();
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 300);
}

/** Moves keyboard focus with an in-page jump so the next Tab continues from the target. */
export function focusTarget(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

async function load() {
  const [{ gsap }, { ScrollTrigger }, { default: LenisCtor }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new LenisCtor({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.hash && document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
      focusTarget(target);
      history.replaceState(null, '', a.hash);
    }),
  );

  const motion: Motion = { gsap, ScrollTrigger, lenis };
  (window as unknown as { __motion?: Motion }).__motion = motion;
  window.dispatchEvent(new CustomEvent('motion:ready', { detail: motion }));

  ScrollTrigger.refresh();
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) lenis.scrollTo(target, { offset: -72, immediate: true });
}
