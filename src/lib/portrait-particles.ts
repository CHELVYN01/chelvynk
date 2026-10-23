import * as THREE from "three";

// Potret partikel dari foto (latar transparan) untuk hero home. Modul ini hanya
// di-import secara dinamis di layar >768px, jadi HP tidak mengunduh three.js.

// Atur kepekatan potret di sini (0..1). Sengaja rendah supaya terlihat buram.
const OPACITY_LIGHT = 0.55;
const OPACITY_DARK = 0.5;
// Warna bagian yang senada dengan latar (rambut hitam di mode gelap, wajah
// terang di mode terang) supaya tidak hilang. Ganti ke warna apa pun kalau mau.
const SHADOW_DARK = 0x737373;
const SHADOW_LIGHT = 0x9a9a9a;
// Lebar sampel foto (piksel). Makin besar makin detail, makin berat.
const SAMPLE_WIDTH = 240;
// Ketajaman detail wajah (mata, hidung, bibir). 0 = asli, makin besar makin tajam.
const SHARPEN = 1.5;
// Tinggi potret dalam satuan scene.
const PORTRAIT_H = 4.6;
// Tinggi potret relatif terhadap tinggi hero (1 = setinggi hero).
const PORTRAIT_FILL = 1.0;
// Jarak tepi kiri foto dari tepi kiri layar (0 = menempel).
const PORTRAIT_LEFT = 0;

const rnd = Math.random;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Sample = { x: number; y: number; lum: number };

// Box blur terpisah (horizontal lalu vertikal) dengan radius r.
function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += src[y * w + clamp(x + k, 0, w - 1)];
      tmp[y * w + x] = s / (2 * r + 1);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[clamp(y + k, 0, h - 1) * w + x];
      out[y * w + x] = s / (2 * r + 1);
    }
  }
  return out;
}

async function samplePhoto(src: string): Promise<{ pts: Sample[]; w: number; h: number }> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = SAMPLE_WIDTH;
  const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const L = new Float32Array(w * h);
  const M = new Float32Array(w * h);
  for (let j = 0; j < w * h; j++) {
    const i = j * 4;
    // Abaikan latar transparan dan tepi semi-transparan (sisa potongan)
    if (data[i + 3] < 160) continue;
    M[j] = 1;
    L[j] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
  }

  // Unsharp mask: tonjolkan beda terang-gelap lokal (garis mata, hidung, bibir).
  // Blur hanya dihitung dari piksel foto, latar transparan tidak ikut.
  const r = Math.max(2, Math.round(w / 40));
  const blurLM = boxBlur(L.map((v, j) => v * M[j]), w, h, r);
  const blurM = boxBlur(M, w, h, r);

  const pts: Sample[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const j = y * w + x;
      if (!M[j]) continue;
      const local = blurLM[j] / Math.max(blurM[j], 0.001);
      pts.push({ x, y, lum: L[j] + SHARPEN * (L[j] - local) });
    }
  }

  // Rentangkan kontras (persentil 2%–98%) supaya wajah tetap terbaca.
  const sorted = pts.map((p) => p.lum).sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.02)] ?? 0;
  const hi = sorted[Math.floor(sorted.length * 0.98)] ?? 1;
  for (const p of pts) p.lum = clamp((p.lum - lo) / Math.max(hi - lo, 0.01), 0, 1);
  return { pts, w, h };
}

const vertexShader = /* glsl */ `
  attribute vec3 aDust;
  attribute float aLum;
  attribute float aRand;
  uniform float uIntro, uScatter, uTime, uMotion, uDark, uSize, uPR;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  varying float vAlpha;
  varying float vTone;

  void main() {
    // Masuk: partikel berkumpul dari debu jadi wajah, bergiliran acak
    float d = aRand * 0.45;
    float t = smoothstep(d, d + 0.55, uIntro);
    // Scroll: wajah buyar kembali jadi debu
    float s = smoothstep(aRand * 0.5, aRand * 0.5 + 0.5, uScatter);
    vec3 pos = mix(aDust, position, t * (1.0 - s));

    // Getar halus supaya terasa hidup
    pos.xy += vec2(sin(uTime * 0.8 + aRand * 40.0), cos(uTime * 0.7 + aRand * 30.0)) * 0.006 * uMotion;

    // Kursor mendorong partikel menjauh
    vec2 dm = pos.xy - uMouse;
    float dist = length(dm);
    float push = exp(-dist * dist / 0.16) * 0.32 * uMouseOn * uMotion;
    pos.xy += dm / max(dist, 0.0001) * push;
    pos.z += push * 0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Gelap: titik putih di bagian terang. Terang: titik hitam di bagian gelap.
    // Bagian yang senada dengan latar tidak dibuang, tapi diwarnai abu-abu (uShadow).
    // Di mode terang nada tengah (kulit) digelapkan sedikit supaya wajah tidak pucat.
    float tone = pow(mix(1.0 - aLum, aLum, uDark), mix(0.75, 1.0, uDark));
    vTone = tone;
    gl_PointSize = uSize * (0.75 + 0.7 * tone) * (0.7 + 0.6 * aRand) * uPR * (10.0 / -mv.z);
    vAlpha = (0.35 + 0.65 * pow(tone, 1.1)) * (0.55 + 0.45 * aRand) * t * (1.0 - s);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShadow;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTone;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.3);
    vec3 color = mix(uShadow, uColor, smoothstep(0.15, 0.75, vTone));
    gl_FragColor = vec4(color, clamp(a * vAlpha * uOpacity, 0.0, 1.0));
  }
`;

export type Portrait = { setDark(dark: boolean): void; destroy(): void };

export async function createPortrait(
  canvas: HTMLCanvasElement,
  opts: { src: string; dark: boolean },
): Promise<Portrait> {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { pts, w, h } = await samplePhoto(opts.src);
  const N = pts.length;
  const unit = PORTRAIT_H / h;

  const pos = new Float32Array(N * 3);
  const dust = new Float32Array(N * 3);
  const lum = new Float32Array(N);
  const rand = new Float32Array(N);
  pts.forEach((p, i) => {
    const z = (p.lum - 0.5) * 0.3; // relief tipis: bagian terang sedikit maju
    pos.set([(p.x + rnd() - w / 2) * unit, -(p.y + rnd() - h / 2) * unit, z], i * 3);
    const a = rnd() * Math.PI * 2;
    const r = 2 + rnd() * 5;
    dust.set([Math.cos(a) * r * 1.2, Math.sin(a) * r, (rnd() - 0.5) * 6], i * 3);
    lum[i] = p.lum;
    rand[i] = rnd();
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDust", new THREE.BufferAttribute(dust, 3));
  geo.setAttribute("aLum", new THREE.BufferAttribute(lum, 1));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uIntro: { value: reduce ? 1 : 0 },
    uScatter: { value: 0 },
    uTime: { value: 0 },
    uMotion: { value: reduce ? 0 : 1 },
    uDark: { value: 0 },
    uSize: { value: 2.4 },
    uPR: { value: 1 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uMouseOn: { value: 0 },
    uColor: { value: new THREE.Color() },
    uShadow: { value: new THREE.Color() },
    uOpacity: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const group = new THREE.Group();
  const cloud = new THREE.Points(geo, material);
  cloud.frustumCulled = false;
  group.add(cloud);
  scene.add(group);

  function setDark(dark: boolean) {
    uniforms.uDark.value = dark ? 1 : 0;
    uniforms.uColor.value.set(dark ? 0xffffff : 0x0a0a0a);
    uniforms.uShadow.value.set(dark ? SHADOW_DARK : SHADOW_LIGHT);
    uniforms.uOpacity.value = dark ? OPACITY_DARK : OPACITY_LIGHT;
  }
  setDark(opts.dark);

  function resize() {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    uniforms.uPR.value = renderer.getPixelRatio();
    // Potret menempel ke dasar dan rata kiri canvas, seperti foto setengah badan
    const viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(15));
    const viewW = viewH * camera.aspect;
    const scale = (viewH * PORTRAIT_FILL) / PORTRAIT_H;
    group.scale.setScalar(scale);
    group.position.y = -viewH / 2 + (PORTRAIT_H * scale) / 2;
    group.position.x = -viewW / 2 + (w * unit * scale) / 2 + PORTRAIT_LEFT;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Posisi kursor → titik di bidang potret (koordinat lokal group).
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  let tmx = 0, tmy = 0, mx = 0, my = 0, inside = false;
  const target = new THREE.Vector2(99, 99);
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    inside = Math.abs(ndc.x) <= 1.1 && Math.abs(ndc.y) <= 1.1;
    tmx = clamp(ndc.x, -1, 1);
    tmy = clamp(ndc.y, -1, 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      group.worldToLocal(hit);
      target.set(hit.x, hit.y);
    }
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  // Hanya render saat hero terlihat
  let visible = true;
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
  io.observe(canvas);

  let raf = 0;
  let last = performance.now();
  function frame(now: number) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const k = 1 - Math.exp(-dt * 4);

    uniforms.uTime.value = now / 1000;
    if (!reduce) uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt / 2.4);

    const host = canvas.parentElement ?? canvas;
    const r = host.getBoundingClientRect();
    uniforms.uScatter.value = clamp(-r.top / (r.height * 0.6), 0, 1);

    mx += (tmx - mx) * k;
    my += (tmy - my) * k;
    uniforms.uMouse.value.lerp(target, k * 1.5);
    uniforms.uMouseOn.value += ((inside ? 1 : 0) - uniforms.uMouseOn.value) * k;
    if (!reduce) {
      group.rotation.y = mx * 0.22;
      group.rotation.x = -my * 0.08;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setDark,
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geo.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
