import { richMotionAllowed } from './env';

type Blob = { x: number; y: number; r: number; hue: string; sx: number; sy: number; p: number };

/** Soft drifting light field. Renders at low resolution and is upscaled by CSS blur; pauses offscreen. */
export function initHeroCanvas(canvas: HTMLCanvasElement) {
  if (!richMotionAllowed()) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const blobs: Blob[] = [
    { x: 0.22, y: 0.32, r: 0.42, hue: '45,212,191', sx: 0.11, sy: 0.07, p: 0 },
    { x: 0.78, y: 0.28, r: 0.36, hue: '15,118,110', sx: 0.08, sy: 0.12, p: 1.7 },
    { x: 0.62, y: 0.78, r: 0.34, hue: '245,158,11', sx: 0.1, sy: 0.06, p: 3.1 },
    { x: 0.3, y: 0.82, r: 0.3, hue: '56,189,248', sx: 0.07, sy: 0.09, p: 4.4 },
  ];

  const W = 160;
  let H = 90;
  const resize = () => {
    H = Math.round((W * canvas.clientHeight) / Math.max(canvas.clientWidth, 1));
    canvas.width = W;
    canvas.height = H;
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  let visible = true;
  let raf = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const cx = (b.x + Math.sin(t * b.sx + b.p) * 0.12) * W;
      const cy = (b.y + Math.cos(t * b.sy + b.p) * 0.12) * H;
      const r = b.r * Math.max(W, H) * (1 + Math.sin(t * 0.3 + b.p) * 0.08);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${b.hue},0.32)`);
      g.addColorStop(1, `rgba(${b.hue},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    run();
  }).observe(canvas);
  document.addEventListener('visibilitychange', run);
  canvas.dataset.live = '';
  run();
}
