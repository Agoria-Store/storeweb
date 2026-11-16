import { finePointer, prefersReducedMotion } from './env';

export function initCatalog() {
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const status = document.querySelector('[data-filter-status]');

  const apply = (btn: HTMLButtonElement) => {
    const type = btn.dataset.filter!;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    let shown = 0;
    cards.forEach((c) => {
      c.hidden = !(type === 'all' || c.dataset.type === type);
      if (!c.hidden) shown++;
    });
    if (status) {
      status.textContent = `${shown} ${shown === 1 ? 'product' : 'products'}: ${btn.textContent?.trim()}`;
    }
    if (!prefersReducedMotion()) {
      cards
        .filter((c) => !c.hidden)
        .forEach((c, i) =>
          c.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 420, delay: i * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
          ),
        );
    }
  };
  buttons.forEach((b) => b.addEventListener('click', () => apply(b)));

  cards.forEach((card) => {
    const video = card.querySelector('video');
    const toggle = card.querySelector<HTMLButtonElement>('[data-preview-toggle]');
    if (!video) return;
    const play = () => {
      if (!video.src && video.dataset.src) video.src = video.dataset.src;
      video.play().then(
        () => {
          card.classList.add('is-previewing');
          toggle?.setAttribute('aria-pressed', 'true');
        },
        () => {},
      );
    };
    const stop = () => {
      video.pause();
      card.classList.remove('is-previewing');
      toggle?.setAttribute('aria-pressed', 'false');
    };
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      if (card.classList.contains('is-previewing')) stop();
      else play();
    });
    if (finePointer() && !prefersReducedMotion()) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
    }
  });
}
