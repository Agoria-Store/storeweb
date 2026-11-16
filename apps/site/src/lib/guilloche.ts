/** Guilloche rosette: rings of phase-shifted strands whose radius is a sum of sines. Shared by the 2D fallback and the WebGL renderer. */
export interface Ring {
  r0: number;
  a: number;
  k: number;
  b: number;
  m: number;
  strands: number;
  color: string;
}

export const RINGS: Ring[] = [
  { r0: 0.87, a: 0.07, k: 28, b: 0.02, m: 4, strands: 16, color: '#5fa39b' },
  { r0: 0.71, a: 0.06, k: 18, b: 0.025, m: 6, strands: 12, color: '#1f4d3a' },
  { r0: 0.585, a: 0.025, k: 44, b: 0.01, m: 8, strands: 6, color: '#5fa39b' },
];

export function strand(
  ring: Ring,
  s: number,
  n: number,
  phase = 0,
  out?: Float32Array,
): Float32Array {
  const pts = out ?? new Float32Array(n * 3);
  const off = (s / ring.strands) * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * Math.PI * 2;
    const r =
      ring.r0 +
      ring.a * Math.sin(ring.k * t + off + phase) +
      ring.b * Math.sin(ring.m * t - off * 0.5 - phase * 0.6);
    pts[i * 3] = Math.cos(t) * r;
    pts[i * 3 + 1] = Math.sin(t) * r;
    pts[i * 3 + 2] = 0;
  }
  return pts;
}

/** Static draw for browsers without WebGL or with motion reduced. */
export function draw2d(canvas: HTMLCanvasElement, n = 900) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = canvas.clientWidth;
  canvas.width = canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale((size * dpr) / 2, (size * dpr) / 2);
  ctx.translate(1, 1);
  ctx.lineWidth = 1 / ((size * dpr) / 2);
  for (const ring of RINGS) {
    ctx.strokeStyle = ring.color;
    for (let s = 0; s < ring.strands; s++) {
      const p = strand(ring, s, n);
      ctx.beginPath();
      for (let i = 0; i < n; i++) ctx.lineTo(p[i * 3]!, -p[i * 3 + 1]!);
      ctx.stroke();
    }
  }
}
