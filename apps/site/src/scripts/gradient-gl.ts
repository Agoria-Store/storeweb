import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

const frag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
  varying vec2 vUv;

  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash3(i).x, b = hash3(i + vec2(1, 0)).x, c = hash3(i + vec2(0, 1)).x, d = hash3(i + vec2(1, 1)).x;
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uRes.x / uRes.y * 0.6;
    float t = uTime * 0.05;
    float n1 = noise(uv * 1.6 + vec2(t, -t * 0.7));
    float n2 = noise(uv * 2.4 - vec2(t * 0.8, t * 0.4) + n1);
    vec3 col = mix(c0, c1, smoothstep(0.15, 0.85, n1));
    col = mix(col, c2, smoothstep(0.45, 0.95, n2) * 0.85);
    col = mix(col, c3, smoothstep(0.55, 1.0, noise(uv * 3.0 + vec2(-t, t) + n2)) * 0.7);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** Slow flowing four-colour gradient. Returns false when WebGL is unavailable. */
export function mountGradient(host: HTMLElement): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(1);
  host.appendChild(renderer.domElement);

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new Vector2(1, 1) },
    c0: { value: hex('#5b3df5') },
    c1: { value: hex('#ff7ac6') },
    c2: { value: hex('#ffd23f') },
    c3: { value: hex('#5eead4') },
  };
  const scene = new Scene();
  scene.add(
    new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag }),
    ),
  );
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Rendered at half resolution: the field is soft, so pixels are wasted fill-rate.
  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)), false);
    uniforms.uRes.value.set(w, h);
  };
  resize();
  new ResizeObserver(resize).observe(host);

  const start = performance.now() - 20000;
  const frame = () => {
    uniforms.uTime.value = (performance.now() - start) / 1000;
    renderer.render(scene, camera);
  };
  let visible = true;
  const loop = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    loop();
  }).observe(host);
  document.addEventListener('visibilitychange', loop);
  frame();
  host.dataset.live = '';
  return true;
}
