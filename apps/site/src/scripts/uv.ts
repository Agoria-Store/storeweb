import { finePointer } from './env';

/** UV lamp: a toggle that reveals the fluorescent layer, following the pointer on desktop and covering the note elsewhere. */
export function initUv(note: HTMLElement) {
  const btn = note.querySelector<HTMLButtonElement>('[data-uv-toggle]');
  const label = btn?.querySelector('[data-uv-label]');
  if (!btn) return;
  const follow = finePointer();

  const set = (on: boolean) => {
    note.classList.toggle('uv-on', on);
    note.classList.toggle('uv-follow', on && follow);
    btn.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? 'Turn off UV light' : 'Check under UV light';
    if (on && follow) {
      const r = btn.getBoundingClientRect();
      const n = note.getBoundingClientRect();
      note.style.setProperty('--lx', `${r.left - n.left + r.width / 2}px`);
      note.style.setProperty('--ly', `${r.top - n.top}px`);
    }
  };
  btn.addEventListener('click', () => set(!note.classList.contains('uv-on')));
  note.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') set(false);
  });
  if (follow) {
    note.addEventListener('pointermove', (e) => {
      if (!note.classList.contains('uv-on')) return;
      const n = note.getBoundingClientRect();
      note.style.setProperty('--lx', `${e.clientX - n.left}px`);
      note.style.setProperty('--ly', `${e.clientY - n.top}px`);
    });
  }
}
