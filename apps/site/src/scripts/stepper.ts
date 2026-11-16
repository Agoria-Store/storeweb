import { prefersReducedMotion } from './env';

type Motion = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

export function initStepper() {
  const root = document.querySelector<HTMLElement>('[data-stepper]');
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  let current = 0;

  const select = (i: number, focus = false) => {
    if (i === current && !focus) return;
    current = i;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((p, j) => {
      p.hidden = j !== i;
      if (j === i && !prefersReducedMotion()) {
        p.animate(
          [
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
    });
    if (focus) tabs[i]?.focus();
  };

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
      const next = keys[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select((next + tabs.length) % tabs.length, true);
    });
  });

  const status = root.querySelector('[data-copy-status]');
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) =>
    b.addEventListener('click', async () => {
      const label = b.querySelector('[data-copy-label]');
      try {
        await navigator.clipboard.writeText(b.dataset.copy!);
        if (label) label.textContent = 'Copied ✓';
        if (status) status.textContent = 'Amount copied';
      } catch {
        if (label) label.textContent = 'Copy not available';
      }
      setTimeout(() => label && (label.textContent = 'Try it: copy amount'), 1800);
    }),
  );

  // Pinned scroll sequence: desktop + motion only.
  let scrollToStep: ((i: number) => void) | undefined;
  const pin = ({ gsap, ScrollTrigger }: Motion) => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const perStep = window.innerHeight * 0.6;
      const st = ScrollTrigger.create({
        trigger: root,
        pin: root.querySelector('[data-stepper-pin]'),
        start: 'top top',
        end: `+=${perStep * tabs.length}`,
        onUpdate: (self) => {
          const pos = self.progress * tabs.length;
          const i = Math.min(tabs.length - 1, Math.floor(pos));
          tabs.forEach((t, j) =>
            t.style.setProperty('--p', String(j < i ? 1 : j === i ? pos - i : 0)),
          );
          select(i);
        },
      });
      scrollToStep = (i) => window.scrollTo({ top: st.start + perStep * (i + 0.5) });
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
