import { prefersReducedMotion } from './env';

/** Animates native <details>; a #hash opens its matching item. Behaviour stays native without JS. */
export function initAccordion(root: ParentNode = document) {
  const id = location.hash.slice(1);
  const target = id ? root.querySelector<HTMLDetailsElement>(`details#${CSS.escape(id)}`) : null;
  if (target) {
    root.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => (d.open = false));
    target.open = true;
  }

  if (prefersReducedMotion()) return;
  root.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
    d.querySelector('summary')?.addEventListener('click', (e) => {
      if (d.open) return;
      e.preventDefault();
      d.open = true;
      d.querySelector<HTMLElement>('.panel')?.animate(
        [
          { opacity: 0, transform: 'translateY(-6px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
    });
  });
}
