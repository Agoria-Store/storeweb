import { prefersReducedMotion } from './env';

/** Animates native <details> open/close; behaviour stays native without JS or with reduced motion. */
export function initAccordion(root: ParentNode = document) {
  const open = (d: HTMLDetailsElement) => {
    d.open = true;
    const panel = d.querySelector<HTMLElement>('.panel');
    panel?.animate(
      [
        { opacity: 0, transform: 'translateY(-6px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
    );
  };

  const target =
    location.hash && root.querySelector<HTMLDetailsElement>(`details${CSS.escape(location.hash)}`);
  if (target) target.open = true;

  if (prefersReducedMotion()) return;
  root.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
    d.querySelector('summary')?.addEventListener('click', (e) => {
      if (d.open) return;
      e.preventDefault();
      open(d);
    });
  });
}
