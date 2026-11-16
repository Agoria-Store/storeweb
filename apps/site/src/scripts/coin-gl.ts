import {
  ACESFilmicToneMapping,
  BoxGeometry,
  DirectionalLight,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Coin profile (radius, height) swept around the axis: recessed face, raised rim, rounded edge. */
function coinGeometry() {
  const pts = [
    [0, 0.085],
    [0.8, 0.085],
    [0.84, 0.125],
    [0.95, 0.125],
    [0.99, 0.1],
    [1.0, 0.05],
    [1.0, -0.05],
    [0.99, -0.1],
    [0.95, -0.125],
    [0.84, -0.125],
    [0.8, -0.085],
    [0, -0.085],
  ].map(([x, y]) => new Vector2(x, y));
  const g = new LatheGeometry(pts, 72);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Tether-style mark: a T with a flattened ring through its stem. */
function emblem(material: MeshStandardMaterial, z: number) {
  const group = new Group();
  const bar = new Mesh(new BoxGeometry(0.86, 0.17, 0.05), material);
  bar.position.set(0, 0.34, 0);
  const stem = new Mesh(new BoxGeometry(0.2, 0.74, 0.05), material);
  stem.position.set(0, -0.12, 0);
  const ring = new Mesh(new TorusGeometry(0.38, 0.03, 12, 64), material);
  ring.scale.set(1, 0.32, 0.5);
  ring.position.set(0, 0.06, 0);
  group.add(bar, stem, ring);
  group.position.z = z;
  if (z < 0) group.rotation.y = Math.PI;
  return group;
}

/** Mounts the coin into host. Returns false if WebGL is unavailable. */
export function mountCoin(host: HTMLElement, scrollArea: HTMLElement): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(2, 3, 4);
  scene.add(key);

  const body = new MeshStandardMaterial({
    color: 0x26a17b,
    metalness: 0.75,
    roughness: 0.28,
  });
  const mark = new MeshStandardMaterial({
    color: 0xf3fff9,
    metalness: 0.55,
    roughness: 0.22,
  });

  const coin = new Group();
  coin.add(new Mesh(coinGeometry(), body), emblem(mark, 0.1), emblem(mark, -0.1));
  scene.add(coin);

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(host);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  scrollArea.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  scrollArea.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  let scroll = 0;
  const start = performance.now();
  let last = start;
  let spin = 0;
  const frame = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = (now - start) / 1000;
    const r = scrollArea.getBoundingClientRect();
    const target = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    scroll += (target - scroll) * 0.12;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    spin += dt * 0.35;

    const intro = 1 - Math.pow(1 - Math.min(t / 1.6, 1), 4);
    coin.rotation.y = spin + scroll * Math.PI * 2 + pointer.x * 0.5 + (1 - intro) * -2.4;
    coin.rotation.x = -0.12 + pointer.y * 0.25;
    coin.position.y = Math.sin(t * 1.2) * 0.05 + scroll * 0.6;
    coin.scale.setScalar(0.85 + intro * 0.15);
    renderer.render(scene, camera);
  };

  let visible = true;
  let lost = false;
  const loop = () => {
    last = performance.now();
    renderer.setAnimationLoop(visible && !document.hidden && !lost ? frame : null);
  };
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    loop();
  }).observe(host);
  document.addEventListener('visibilitychange', loop);
  renderer.domElement.addEventListener('webglcontextlost', () => {
    lost = true;
    loop();
    renderer.domElement.remove();
    delete host.dataset.live;
  });

  frame();
  host.dataset.live = '';
  return true;
}
