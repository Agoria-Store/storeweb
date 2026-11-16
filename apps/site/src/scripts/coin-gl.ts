import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  Shape,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const GOLD = 0xcf8f25;
const FACE_R = 0.8;
const FACE_Z = 0.085;

/** Engraving for the coin face, drawn once on a canvas and used as bump + roughness detail. */
function faceTexture(): CanvasTexture {
  // Drawn in 1024-unit space onto a 2048 canvas so engraving edges stay crisp up close.
  const size = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#7a7a7a';
  g.fillRect(0, 0, size, size);
  g.translate(size / 2, size / 2);
  g.scale(2, 2);

  // Raised rings framing the inscription.
  g.strokeStyle = '#fff';
  g.lineWidth = 7;
  for (const r of [492, 404]) {
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 396, 0, Math.PI * 2);
  g.stroke();

  // Inscription around the rim.
  const text = 'BITCOIN • PEER-TO-PEER ELECTRONIC CASH • 21 000 000 • ';
  g.fillStyle = '#fff';
  g.font = '600 34px system-ui, sans-serif';
  const chars = [...text.repeat(2)];
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    g.save();
    g.rotate(i * step);
    g.translate(0, -432);
    g.fillText(ch, -g.measureText(ch).width / 2, 12);
    g.restore();
  });

  // Circuit traces: radial runs with a right-angle jog and a pad at each end.
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + 0.05;
    const r1 = 300 + (i % 3) * 18;
    const r2 = 380;
    const jog = (i % 2 ? 1 : -1) * 0.05;
    const p = (r: number, ang: number) => [Math.cos(ang) * r, Math.sin(ang) * r] as const;
    const [x1, y1] = p(r1, a);
    const [x2, y2] = p((r1 + r2) / 2, a);
    const [x3, y3] = p((r1 + r2) / 2, a + jog);
    const [x4, y4] = p(r2, a + jog);
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.lineTo(x3, y3);
    g.lineTo(x4, y4);
    g.stroke();
    g.beginPath();
    g.arc(x1, y1, 9, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

/** Vertical ridges for the reeded edge. */
function edgeTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 4;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 32, 0);
  grad.addColorStop(0, '#202020');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#202020');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 4);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(200, 1);
  return tex;
}

/** The ₿ glyph: a B with two bowls (cut as holes) and two strokes through the top and bottom. */
function bitcoinGlyph(material: MeshStandardMaterial): Group {
  const b = new Shape();
  b.moveTo(-0.27, -0.45);
  b.lineTo(0.07, -0.45);
  b.bezierCurveTo(0.33, -0.45, 0.36, -0.06, 0.12, -0.02);
  b.bezierCurveTo(0.3, 0.03, 0.28, 0.42, 0.05, 0.42);
  b.lineTo(-0.27, 0.42);
  b.closePath();
  const low = new Shape();
  low.moveTo(-0.13, -0.33);
  low.lineTo(-0.13, -0.08);
  low.lineTo(0.05, -0.08);
  low.bezierCurveTo(0.2, -0.08, 0.2, -0.33, 0.05, -0.33);
  low.closePath();
  const high = new Shape();
  high.moveTo(-0.13, 0.05);
  high.lineTo(-0.13, 0.3);
  high.lineTo(0.03, 0.3);
  high.bezierCurveTo(0.16, 0.3, 0.16, 0.05, 0.03, 0.05);
  high.closePath();
  b.holes.push(low, high);

  const extrude = {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 4,
    curveSegments: 32,
  };
  const group = new Group();
  group.add(new Mesh(new ExtrudeGeometry(b, extrude), material));
  for (const x of [-0.1, 0.02]) {
    for (const [y0, y1] of [
      [0.4, 0.56],
      [-0.59, -0.43],
    ]) {
      const s = new Shape();
      s.moveTo(x, y0!);
      s.lineTo(x + 0.065, y0!);
      s.lineTo(x + 0.065, y1!);
      s.lineTo(x, y1!);
      s.closePath();
      group.add(new Mesh(new ExtrudeGeometry(s, extrude), material));
    }
  }
  group.rotation.z = -0.24;
  group.scale.setScalar(0.92);
  return group;
}

function rimHalf(sign: 1 | -1) {
  const pts = [
    [FACE_R, FACE_Z],
    [0.83, 0.125],
    [0.95, 0.125],
    [0.99, 0.1],
    [1.0, 0.065],
  ].map(([x, y]) => new Vector2(x!, y! * sign));
  if (sign < 0) pts.reverse();
  const g = new LatheGeometry(pts, 160);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Mounts the coin into host. Returns false if WebGL is unavailable. */
export function mountCoin(host: HTMLElement, scrollArea: HTMLElement): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  pmrem.dispose();
  const key = new DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 4, 5);
  const rim = new DirectionalLight(0xffe2a8, 1.4);
  rim.position.set(-4, -1, -2);
  scene.add(key, rim);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const engraving = faceTexture();
  engraving.anisotropy = maxAniso;
  const face = new MeshStandardMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.3,
    bumpMap: engraving,
    bumpScale: 1,
  });
  const polished = new MeshStandardMaterial({ color: 0xffd47e, metalness: 1, roughness: 0.1 });
  const reeds = edgeTexture();
  reeds.anisotropy = maxAniso;
  const edge = new MeshStandardMaterial({
    color: 0xd9962c,
    metalness: 1,
    roughness: 0.3,
    bumpMap: reeds,
    bumpScale: 0.8,
  });

  const coin = new Group();
  const front = new Mesh(new CircleGeometry(FACE_R, 128), face);
  front.position.z = FACE_Z;
  const back = new Mesh(new CircleGeometry(FACE_R, 128), face);
  back.position.z = -FACE_Z;
  back.rotation.y = Math.PI;
  const edgeMesh = new Mesh(new CylinderGeometry(1, 1, 0.13, 240, 1, true), edge);
  edgeMesh.rotation.x = Math.PI / 2;
  const glyphFront = bitcoinGlyph(polished);
  glyphFront.position.z = FACE_Z - 0.005;
  const glyphBack = bitcoinGlyph(polished);
  glyphBack.position.z = -FACE_Z + 0.005;
  glyphBack.rotation.y = Math.PI;
  coin.add(
    front,
    back,
    edgeMesh,
    new Mesh(rimHalf(1), polished),
    new Mesh(rimHalf(-1), polished),
    glyphFront,
    glyphBack,
  );
  scene.add(coin);

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  // Size the drawing buffer to the canvas as displayed (CSS makes it larger than host),
  // otherwise the browser upscales the image and it blurs.
  const canvas = renderer.domElement;
  const resize = () => {
    const w = canvas.clientWidth || host.clientWidth;
    const h = canvas.clientHeight || host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  // Pointer offset from the coin's own centre, -1..1, so the coin turns to look at the cursor.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  scrollArea.addEventListener('pointermove', (e) => {
    const b = host.getBoundingClientRect();
    pointer.tx = clamp((e.clientX - (b.left + b.width / 2)) / (window.innerWidth / 2));
    pointer.ty = clamp((e.clientY - (b.top + b.height / 2)) / (window.innerHeight / 2));
  });
  scrollArea.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  let scroll = 0;
  const start = performance.now();
  const frame = () => {
    const t = (performance.now() - start) / 1000;
    const r = scrollArea.getBoundingClientRect();
    const target = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    scroll += (target - scroll) * 0.12;
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    // A slow float plus a small tilt toward the cursor; scrolling out of the hero turns it once.
    const intro = 1 - Math.pow(1 - Math.min(t / 1.6, 1), 4);
    coin.rotation.y =
      -0.22 +
      Math.sin(t * 0.6) * 0.1 +
      pointer.x * 0.32 +
      scroll * Math.PI * 2 +
      (1 - intro) * -2.4;
    coin.rotation.x = Math.sin(t * 0.45) * 0.04 + pointer.y * 0.24;
    coin.position.y = Math.sin(t * 1.1) * 0.045 + scroll * 0.5;
    coin.scale.setScalar(0.85 + intro * 0.15);
    renderer.render(scene, camera);
  };

  let visible = true;
  let lost = false;
  const loop = () => renderer.setAnimationLoop(visible && !document.hidden && !lost ? frame : null);
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
