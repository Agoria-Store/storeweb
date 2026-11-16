import { finePointer, prefersReducedMotion } from './env';

export function initCatalog() {
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  if (!grid) return;
  const rows = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const status = document.querySelector('[data-filter-status]');

  const apply = (type: string, announce: boolean) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === type)));
    let shown = 0;
    rows.forEach((r) => {
      r.hidden = !(type === 'all' || r.dataset.type === type);
      if (!r.hidden) shown++;
    });
    if (announce && status) status.textContent = `${shown} products shown`;
    if (announce && !prefersReducedMotion()) {
      rows
        .filter((r) => !r.hidden)
        .forEach((r, i) =>
          r.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            delay: i * 40,
            easing: 'ease-out',
            fill: 'backwards',
          }),
        );
    }
  };
  apply(grid.dataset.default ?? 'all', false);
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter!, true)));

  rows.forEach((row) => {
    const video = row.querySelector('video');
    const toggle = row.querySelector<HTMLButtonElement>('[data-preview-toggle]');
    if (!video) return;
    const play = () => {
      if (!video.src && video.dataset.src) video.src = video.dataset.src;
      video.play().then(
        () => {
          row.classList.add('is-previewing');
          toggle?.setAttribute('aria-pressed', 'true');
        },
        () => {},
      );
    };
    const stop = () => {
      video.pause();
      row.classList.remove('is-previewing');
      toggle?.setAttribute('aria-pressed', 'false');
    };
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      if (row.classList.contains('is-previewing')) stop();
      else play();
    });
    if (finePointer() && !prefersReducedMotion()) {
      row.addEventListener('pointerenter', play);
      row.addEventListener('pointerleave', stop);
    }
  });
}
