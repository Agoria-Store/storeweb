import { prefersReducedMotion } from './env';

type Motion = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

/** Loads GSAP + Lenis after first paint, only when motion is allowed. Content is visible without it. */
export function initMotion() {
  if (prefersReducedMotion()) return;
  const start = () => void load();
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 300);
}

async function load() {
  const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.hash && document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
      history.replaceState(null, '', a.hash);
    }),
  );

  const motion: Motion = { gsap, ScrollTrigger };
  (window as unknown as { __motion?: Motion }).__motion = motion;
  window.dispatchEvent(new CustomEvent('motion:ready', { detail: motion }));

  // Pinning adds spacer height, so re-resolve a deep-linked anchor once layout settles.
  ScrollTrigger.refresh();
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) lenis.scrollTo(target, { offset: -72, immediate: true });
}
