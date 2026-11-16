import { finePointer, prefersReducedMotion } from './env';

export function initCatalog() {
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const status = document.querySelector('[data-filter-status]');

  const apply = (type: string, animate: boolean) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === type)));
    let shown = 0;
    cards.forEach((c) => {
      const show = type === 'all' || c.dataset.type === type;
      c.hidden = !show;
      if (show) shown++;
    });
    if (status) status.textContent = `${shown} products shown`;
    if (animate && !prefersReducedMotion()) {
      cards
        .filter((c) => !c.hidden)
        .forEach((c, i) =>
          c.animate(
            [
              { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 450, delay: i * 50, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
          ),
        );
    }
    window.dispatchEvent(new Event('resize'));
  };
  apply(grid.dataset.default ?? 'all', false);
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter!, true)));

  cards.forEach((card) => {
    const video = card.querySelector('video');
    const toggle = card.querySelector<HTMLButtonElement>('[data-preview-toggle]');
    const play = () => {
      if (!video) return;
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
      if (!video) return;
      video.pause();
      card.classList.remove('is-previewing');
      toggle?.setAttribute('aria-pressed', 'false');
    };
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      if (card.classList.contains('is-previewing')) stop();
      else play();
    });

    if (!finePointer()) return;
    if (!prefersReducedMotion()) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
    }
    if (prefersReducedMotion()) return;

    const inner = card.firstElementChild as HTMLElement;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      inner.style.setProperty('--gx', `${x * 100}%`);
      inner.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}
