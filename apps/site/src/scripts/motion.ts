import { prefersReducedMotion } from './env';

/** Loads GSAP + Lenis after first paint, only when motion is allowed. Without it, content is static and fully visible. */
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

  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.hash && document.querySelector(a.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
      history.replaceState(null, '', a.hash);
    }),
  );

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
      ),
  });

  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = String(Math.round(obj.v))),
    });
  });

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      yPercent: Number(el.dataset.parallax) || 12,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  window.dispatchEvent(new CustomEvent('motion:ready', { detail: { gsap, ScrollTrigger } }));
  (window as unknown as { __motion?: unknown }).__motion = { gsap, ScrollTrigger };

  // Pinning adds spacer height, so re-resolve a deep-linked anchor once layout settles.
  ScrollTrigger.refresh();
  const target =
    location.hash &&
    document.querySelector<HTMLElement>(CSS.escape(location.hash).replace(/^\\#/, '#'));
  if (target) lenis.scrollTo(target, { offset: -72, immediate: true });
}
