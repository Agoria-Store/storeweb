import { prefersReducedMotion } from './env';
import type { Motion } from './motion';

/**
 * Without JS, or below 900px, every step is shown as a plain list.
 * At 900px+ the steps become tabs; with motion on, scroll position drives them while pinned.
 */
export function initStepper() {
  const root = document.querySelector<HTMLElement>('[data-stepper]');
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const wide = matchMedia('(min-width: 900px)');
  let current = 0;
  let scrollToStep: ((i: number) => void) | undefined;

  const render = (animate: boolean) => {
    const tabbed = wide.matches;
    root.classList.toggle('is-tabbed', tabbed);
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === current));
      t.tabIndex = j === current ? 0 : -1;
    });
    panels.forEach((p, j) => {
      p.hidden = tabbed && j !== current;
      if (tabbed && animate && j === current && !prefersReducedMotion()) {
        p.animate(
          [
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
    });
  };
  const select = (i: number, animate = true) => {
    if (i === current) return;
    current = i;
    render(animate);
  };
  render(false);
  wide.addEventListener('change', () => render(false));

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      select(i);
      scrollToStep?.(i);
    });
    t.addEventListener('keydown', (e) => {
      const keys: Record<string, number> = {
        ArrowDown: i + 1,
        ArrowRight: i + 1,
        ArrowUp: i - 1,
        ArrowLeft: i - 1,
        Home: 0,
        End: tabs.length - 1,
      };
      const raw = keys[e.key];
      if (raw === undefined) return;
      e.preventDefault();
      const next = (raw + tabs.length) % tabs.length;
      select(next);
      scrollToStep?.(next);
      tabs[next]?.focus();
    });
  });

  const pin = ({ gsap, ScrollTrigger, lenis }: Motion) => {
    gsap.matchMedia().add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const perStep = () => window.innerHeight * 0.6;
      const st = ScrollTrigger.create({
        trigger: root,
        pin: root.querySelector('[data-stepper-pin]'),
        start: 'top top',
        end: () => `+=${perStep() * tabs.length}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const pos = self.progress * tabs.length;
          const i = Math.min(tabs.length - 1, Math.floor(pos));
          tabs.forEach((t, j) =>
            t.style.setProperty('--p', String(j < i ? 1 : j === i ? pos - i : 0)),
          );
          select(i);
        },
      });
      scrollToStep = (i) => lenis.scrollTo(st.start + perStep() * (i + 0.5));
      return () => {
        scrollToStep = undefined;
        tabs.forEach((t) => t.style.removeProperty('--p'));
      };
    });
  };

  const w = window as unknown as { __motion?: Motion };
  if (w.__motion) pin(w.__motion);
  else
    window.addEventListener('motion:ready', (e) => pin((e as CustomEvent<Motion>).detail), {
      once: true,
    });
}
