import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { RINGS, strand } from '../lib/guilloche';

const N = 900;
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

/** Draws the rosette in once, then lets the pointer drift its phase. Returns false if WebGL is unavailable. */
export function mountRosette(host: HTMLElement, pointerArea: HTMLElement): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;

  const lines = RINGS.flatMap((ring) =>
    Array.from({ length: ring.strands }, (_, s) => {
      const geo = new BufferGeometry();
      geo.setAttribute('position', new BufferAttribute(strand(ring, s, N), 3));
      geo.setDrawRange(0, 0);
      const line = new Line(geo, new LineBasicMaterial({ color: new Color(ring.color) }));
      scene.add(line);
      return { line, geo, ring, s };
    }),
  );

  const resize = () => {
    const size = host.clientWidth;
    renderer.setSize(size, size, false);
  };
  resize();
  new ResizeObserver(resize).observe(host);

  let target = 0;
  let phase = 0;
  pointerArea.addEventListener('pointermove', (e) => {
    const r = pointerArea.getBoundingClientRect();
    target = ((e.clientX - r.left) / r.width - 0.5) * 1.2;
  });
  pointerArea.addEventListener('pointerleave', () => (target = 0));

  const start = performance.now();
  let visible = true;
  let drawn = false; // once the draw-in finishes, frames render only while the pointer moves the phase
  const frame = () => {
    const t = (performance.now() - start) / 1800;
    const reveal = easeOutExpo(Math.min(t, 1));
    const delta = target - phase;
    const moving = Math.abs(delta) > 0.001;
    if (drawn && !moving) return;
    phase += delta * 0.08;
    for (const { geo, ring, s } of lines) {
      if (moving) {
        strand(ring, s, N, phase, geo.attributes.position!.array as Float32Array);
        geo.attributes.position!.needsUpdate = true;
      }
      geo.setDrawRange(0, Math.round(N * reveal));
    }
    renderer.render(scene, camera);
    if (reveal >= 1) drawn = true;
  };

  const loop = (on: boolean) => renderer.setAnimationLoop(on ? frame : null);
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    loop(visible && !document.hidden);
  }).observe(host);
  document.addEventListener('visibilitychange', () => loop(visible && !document.hidden));
  host.dataset.live = '';
  return true;
}
