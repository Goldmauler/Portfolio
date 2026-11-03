import * as THREE from 'three';

/*
 * PORTRAIT.FIELD — the opening scene.
 * The photo is sampled into a grid of glyph cells (positive image: brighter
 * pixel → denser, brighter glyph) and cut out with a person mask
 * (public/vimal-mask.png, made once with rembg). Each cell becomes one WebGL
 * point that sits flat where the photo puts it, breathing a fraction of a cell.
 * Motion: intro fly-in, a light sweep, embers rising, a flowing starfield,
 * cells parting around the cursor (they spring back), and the scroll blast.
 */

// Sparse → dense.
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const SCRAMBLE = '01<>/\\{}[]#$%&@*+=?;:';
const STARS = '.+*01:';
const GLYPHS = [...new Set([...SCRAMBLE, ...STARS, ...RAMP])].filter((c) => c !== ' ');
const GLYPH_INDEX = new Map(GLYPHS.map((c, i) => [c, i]));
const ATLAS_COLS = 16;
const ATLAS_ROWS = Math.ceil(GLYPHS.length / ATLAS_COLS);
const CELL = 64;

// Head-and-shoulders crop of the 460×460 photo (fractions).
const CROP = { x0: 0.09, x1: 0.91, y0: 0.1, y1: 0.955 };
const FOV = 35;
const PORTRAIT_H = 2; // world units

const vertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aDir;
  attribute float aGlyph;
  attribute float aBright;
  attribute float aRand;
  attribute float aStar;

  uniform float uTime;
  uniform float uIntro;
  uniform float uScroll;
  uniform float uSize;
  uniform vec3 uMouse;
  uniform float uMouseOn;
  uniform vec2 uMouseVel;
  uniform float uCell;
  uniform float uScrambleCount;

  varying float vAlpha;
  varying float vGlyph;
  varying float vBright;
  varying float vHot;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    // aStar: 0 = portrait cell, 1 = background star, 2 = ember rising off the portrait.
    float isP = 1.0 - step(0.5, aStar);
    float isS = step(0.5, aStar) * (1.0 - step(1.5, aStar));
    float isE = step(1.5, aStar);
    vec3 home = position;
    vec3 target = home;
    float sd = clamp(uScroll * 1.3 - aRand * 0.3, 0.0, 1.0);
    float life = 1.0;

    // Stars keep flowing toward the viewer and wrap round.
    if (isS > 0.5) {
      target.z = -14.0 + mod(home.z + 14.0 + uTime * (0.25 + 0.45 * aRand), 12.5);
      target.xy += vec2(sin(uTime * 0.13 + aRand * 20.0), cos(uTime * 0.11 + aRand * 17.0)) * 0.25;
      life = smoothstep(-14.0, -12.0, target.z) * (1.0 - smoothstep(-2.6, -1.5, target.z));
    }
    // Embers lift off the portrait like sparks, then respawn.
    float ph = 0.0;
    if (isE > 0.5) {
      ph = fract(uTime * (0.045 + 0.07 * aRand) + aRand * 13.0);
      target += vec3(sin(uTime * 0.7 + aRand * 30.0) * 0.05 + aDir.x * ph * 0.35, ph * 1.1 + ph * ph * 0.6, 0.0);
      life = sin(ph * 3.14159) * smoothstep(0.0, 0.08, ph);
    }
    // Portrait cells breathe a fraction of a cell around their spot, so the
    // picture stays exact but never sits dead still.
    if (isP > 0.5) {
      target.xy += vec2(sin(uTime * 1.1 + aRand * 40.0), cos(uTime * 0.9 + aRand * 29.0)) * uCell * 0.16;
    }

    // Cursor: cells part around it, swirl in its wake and spring back.
    vec2 dm = home.xy - uMouse.xy;
    float dl = length(dm);
    float f = (1.0 - isS) * uMouseOn * (1.0 - smoothstep(0.0, 0.34, dl)) * (1.0 - sd);
    vec2 away = dl > 1e-4 ? dm / dl : vec2(0.0);
    vec2 swirl = vec2(-away.y, away.x) * (aRand - 0.5);
    target.xy += (away * 0.09 + swirl * 0.08) * f * f + uMouseVel * f * 0.05;

    float delay = aRand * 0.45 + (1.0 - min(aStar, 1.0)) * (0.5 - home.y * 0.25) * 0.35;
    float d = clamp((uIntro * 1.55 - delay) / 0.9, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - d, 4.0);
    vec3 p = mix(aStart, target, e);
    p += aDir * sd * sd * 7.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, uSize * (1.0 + sd * 1.8) * (isP > 0.5 ? 1.0 : 0.75) / -mv.z);

    // A band of light sweeps across the portrait every few seconds.
    float band = fract(uTime * 0.11) * 4.4 - 2.0;
    float wave = isP * exp(-pow((home.x + home.y * 0.45 - band) * 6.0, 2.0));

    // Glyphs scramble while travelling, in the sweep and under the cursor;
    // everywhere else they show the photo.
    float tick = floor(uTime * 14.0 + aRand * 97.0);
    float scr = max(max((1.0 - e) * 0.95, sd * 0.6), max(wave * 0.3, f * 0.55));
    if (isE > 0.5) scr = 0.25;
    float g = aGlyph;
    if (hash(tick * 1.7 + aRand * 13.0) < scr) g = floor(hash(tick + aRand * 77.0) * uScrambleCount);
    vGlyph = g;

    float hot = isP * f;
    float fadeIn = mix(0.1, 1.0, e) * (isE > 0.5 ? e : 1.0);
    float fadeOut = 1.0 - smoothstep(0.6, 1.0, sd);
    float nearFade = smoothstep(0.25, 1.4, -mv.z);
    vAlpha = min(1.0, aBright + hot * 0.35 + wave * 0.22) * life * fadeIn * fadeOut * nearFade;
    vBright = min(1.0, aBright + wave * 0.3);
    vHot = max(hot, wave * 0.5);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uGrid;
  uniform vec3 uColA;
  uniform vec3 uColHot;
  uniform float uLight;

  varying float vAlpha;
  varying float vGlyph;
  varying float vBright;
  varying float vHot;

  void main() {
    vec2 pc = gl_PointCoord;
    float col = mod(vGlyph, uGrid.x);
    float row = floor(vGlyph / uGrid.x);
    vec2 uv = vec2((col + pc.x) / uGrid.x, 1.0 - (row + pc.y) / uGrid.y);
    float a = texture2D(uAtlas, uv).r;
    float glow = uLight > 0.5 ? 0.0 : texture2D(uAtlas, uv, 2.5).r * 0.45 * vBright;
    float m = max(a, glow);
    if (m < 0.03) discard;
    vec3 c = uColA * (0.7 + 0.3 * vBright);
    c = mix(c, vec3(0.9, 1.0, 0.94), smoothstep(0.55, 1.0, vBright) * 0.55);
    c = mix(c, uColHot, vHot * 0.4);
    if (uLight > 0.5) c = uColA;
    gl_FragColor = vec4(c, m * min(1.0, vAlpha * 1.35));
  }
`;

function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = ATLAS_COLS * CELL;
  cv.height = ATLAS_ROWS * CELL;
  const g = cv.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${CELL * 0.8}px "JetBrains Mono", ui-monospace, monospace`;
  GLYPHS.forEach((ch, i) => {
    g.fillText(ch, (i % ATLAS_COLS) * CELL + CELL / 2, Math.floor(i / ATLAS_COLS) * CELL + CELL / 2 + CELL * 0.03);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

/** Crop + area-average an image down to cols×rows; returns 0..1 luminance. */
function sample(img, cols, rows) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  let src = document.createElement('canvas');
  src.width = Math.round((CROP.x1 - CROP.x0) * W);
  src.height = Math.round((CROP.y1 - CROP.y0) * H);
  let g = src.getContext('2d');
  g.drawImage(img, CROP.x0 * W, CROP.y0 * H, src.width, src.height, 0, 0, src.width, src.height);
  while (src.width / 2 > cols * 1.5) {
    const half = document.createElement('canvas');
    half.width = Math.round(src.width / 2);
    half.height = Math.round(src.height / 2);
    g = half.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, half.width, half.height);
    src = half;
  }
  const out = document.createElement('canvas');
  out.width = cols;
  out.height = rows;
  g = out.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, cols, rows);
  const px = g.getImageData(0, 0, cols, rows).data;
  const v = new Float32Array(cols * rows);
  for (let i = 0; i < v.length; i++) v[i] = (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255;
  return v;
}

function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) {
          s += src[y * w + xx];
          n++;
        }
      }
      tmp[y * w + x] = s / n;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) {
          s += tmp[yy * w + x];
          n++;
        }
      }
      out[y * w + x] = s / n;
    }
  return out;
}

const rand = (a, b) => a + Math.random() * (b - a);

function buildGeometry(img, mask, cols, starCount) {
  const cw = CROP.x1 - CROP.x0;
  const ch = CROP.y1 - CROP.y0;
  const rows = Math.round(cols * ((ch * img.naturalHeight) / (cw * img.naturalWidth)) * 0.5);
  const lum = sample(img, cols, rows);
  const cut = sample(mask, cols, rows);
  const soft = boxBlur(lum, cols, rows, 2);

  // Normalise tones over the person only, so black hair and the white shirt
  // span the whole ramp the way they do in the photo.
  const vals = [];
  for (let i = 0; i < lum.length; i++) if (cut[i] > 0.5) vals.push(lum[i]);
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.02)] ?? 0;
  const hi = vals[Math.floor(vals.length * 0.995)] ?? 1;

  const cellH = PORTRAIT_H / rows;
  const cellW = cellH / 2;
  const width = cols * cellW;
  const pts = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const m = cut[i];
      if (m < 0.35) continue;
      const v0 = lum[i] + 0.6 * (lum[i] - soft[i]);
      const tone = Math.min(1, Math.max(0, (v0 - lo) / (hi - lo))) ** 0.7;
      const gi = Math.round(0.12 * (RAMP.length - 1) + tone * 0.88 * (RAMP.length - 1));
      const glyph = GLYPH_INDEX.get(RAMP[Math.min(RAMP.length - 1, Math.max(1, gi))]);
      const bright = (0.24 + 0.76 * tone) * Math.min(1, (m - 0.35) / 0.4);
      const x = (c + 0.5) * cellW - width / 2;
      const y = PORTRAIT_H / 2 - (r + 0.5) * cellH;
      const th = rand(0, Math.PI * 2);
      const rad = rand(2.2, 6.5);
      const len = Math.hypot(x, y) || 1;
      pts.push({
        target: [x, y, 0],
        start: [Math.cos(th) * rad * 1.4, Math.sin(th) * rad * 0.8, rand(-9, 1.2)],
        dir: [(x / len) * rand(0.4, 1.3) + rand(-0.3, 0.3), (y / len) * rand(0.4, 1.3) + rand(-0.3, 0.3), rand(0.35, 1.2)],
        glyph,
        bright,
        star: 0,
      });
    }
  }

  // Embers: extra sparks born on random portrait cells (the cells themselves stay put).
  const cells = pts.length;
  const emberCount = Math.round(cells * 0.05);
  for (let i = 0; i < emberCount; i++) {
    const src = pts[(Math.random() * cells) | 0];
    const [x, y] = src.target;
    pts.push({
      target: [x, y, 0],
      start: [x * 1.6, y * 1.6 - 1, rand(-6, -1)],
      dir: [rand(-1, 1), rand(0.4, 1.4), rand(0.4, 1.2)],
      glyph: GLYPH_INDEX.get(STARS[(Math.random() * STARS.length) | 0]),
      bright: rand(0.25, 0.6),
      star: 2,
    });
  }

  for (let i = 0; i < starCount; i++) {
    const p = [rand(-9, 9), rand(-5.5, 5.5), rand(-14, -1.5)];
    pts.push({
      target: p,
      start: [p[0] * 1.3, p[1] * 1.3, p[2] - rand(2, 6)],
      dir: [p[0] * 0.05, p[1] * 0.05, rand(0.9, 1.8)],
      glyph: GLYPH_INDEX.get(STARS[(Math.random() * STARS.length) | 0]),
      bright: rand(0.1, 0.38),
      star: 1,
    });
  }

  const n = pts.length;
  const A = {
    position: new Float32Array(n * 3),
    aStart: new Float32Array(n * 3),
    aDir: new Float32Array(n * 3),
    aGlyph: new Float32Array(n),
    aBright: new Float32Array(n),
    aRand: new Float32Array(n),
    aStar: new Float32Array(n),
  };
  pts.forEach((p, i) => {
    A.position.set(p.target, i * 3);
    A.aStart.set(p.start, i * 3);
    A.aDir.set(p.dir, i * 3);
    A.aGlyph[i] = p.glyph;
    A.aBright[i] = p.bright;
    A.aRand[i] = Math.random();
    A.aStar[i] = p.star;
  });
  const geo = new THREE.BufferGeometry();
  Object.entries(A).forEach(([k, v]) => geo.setAttribute(k, new THREE.BufferAttribute(v, v.length === n * 3 ? 3 : 1)));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  return { geo, rows, cellH, aspect: width / PORTRAIT_H };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function createPortraitField(container, { src, mask, reduced, colors, small }) {
  const [img, maskImg] = await Promise.all([loadImage(src), loadImage(mask), document.fonts?.ready]);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 60);

  const { geo, rows, cellH, aspect } = buildGeometry(img, maskImg, small ? 104 : 150, small ? 600 : 1400);
  const atlas = buildAtlas();
  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: reduced ? 1 : 0 },
    uScroll: { value: 0 },
    uSize: { value: 1 },
    uMouse: { value: new THREE.Vector3(9, 9, 0) },
    uMouseOn: { value: 0 },
    uMouseVel: { value: new THREE.Vector2() },
    uCell: { value: cellH },
    uScrambleCount: { value: SCRAMBLE.length },
    uAtlas: { value: atlas },
    uGrid: { value: new THREE.Vector2(ATLAS_COLS, ATLAS_ROWS) },
    uColA: { value: new THREE.Color() },
    uColHot: { value: new THREE.Color() },
    uLight: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  scene.add(points);

  const setColors = ({ a, hot, light }) => {
    uniforms.uColA.value.set(a);
    uniforms.uColHot.value.set(hot);
    uniforms.uLight.value = light ? 1 : 0;
    material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.needsUpdate = true;
  };
  setColors(colors);

  const layout = { z: 4.4, y: 0 };
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const narrow = w / h < 0.95;
    const fitH = PORTRAIT_H / 0.9 / (2 * tan);
    const fitW = (PORTRAIT_H * aspect) / 0.98 / camera.aspect / (2 * tan);
    layout.z = narrow ? fitW : Math.max(fitH, fitW);
    const visH = 2 * tan * layout.z;
    // Desktop: portrait stands on the bottom edge. Phones: upper part.
    layout.y = narrow ? visH / 2 - PORTRAIT_H / 2 - visH * 0.12 : -(visH / 2 - PORTRAIT_H / 2);
    camera.updateProjectionMatrix();
    uniforms.uSize.value = ((PORTRAIT_H / rows) * h * dpr) / (2 * tan);
  };
  resize();

  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const pointer = { nx: 0, ny: 0, on: false };
  let mouseOn = 0;
  const mouseVel = new THREE.Vector2();
  const onMove = (e) => {
    const r = container.getBoundingClientRect();
    pointer.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointer.on = e.clientY >= r.top && e.clientY <= r.bottom;
  };
  const onLeave = () => {
    pointer.on = false;
  };
  if (!reduced) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
  }

  let introStart = 0;
  let scroll = 0;
  let raf = 0;
  let running = false;
  let last = performance.now();
  const clock0 = last;

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uniforms.uTime.value = (now - clock0) / 1000;
    if (introStart) uniforms.uIntro.value = Math.min(1, (now - introStart) / 2600);

    // Straight-on camera: the portrait is never tilted or skewed.
    const s = scroll;
    uniforms.uScroll.value = s;
    camera.position.set(0, 0, layout.z - s * s * 3.2);
    camera.lookAt(0, 0, 0);
    points.position.y = layout.y;
    points.updateMatrixWorld();

    const k = 1 - Math.exp(-dt * 6);
    mouseOn += ((pointer.on && s < 0.3 ? 1 : 0) - mouseOn) * k;
    if (pointer.on) {
      ndc.set(pointer.nx, pointer.ny);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        hit.y -= layout.y;
        // Lagging cursor + its velocity give the cells a flowing wake.
        const m = uniforms.uMouse.value;
        const px = m.x;
        const py = m.y;
        m.lerp(hit, 1 - Math.exp(-dt * 9));
        if (dt > 0) mouseVel.lerp(new THREE.Vector2((m.x - px) / dt, (m.y - py) / dt), 0.25);
      }
    }
    mouseVel.multiplyScalar(Math.exp(-dt * 3));
    if (mouseVel.length() > 3) mouseVel.setLength(3);
    uniforms.uMouseVel.value.copy(mouseVel);
    uniforms.uMouseOn.value = mouseOn;
    renderer.render(scene, camera);
  };

  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    frame(now);
  };
  const play = () => {
    if (running || reduced) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const renderOnce = () => frame(performance.now());

  const ro = new ResizeObserver(() => {
    resize();
    if (!running) renderOnce();
  });
  ro.observe(container);
  renderOnce();

  return {
    start() {
      if (reduced) {
        uniforms.uIntro.value = 1;
        renderOnce();
        return;
      }
      if (!introStart) introStart = performance.now();
    },
    setScroll(p) {
      scroll = reduced ? 0 : p;
      if (!running) renderOnce();
    },
    setColors(c) {
      setColors(c);
      if (!running) renderOnce();
    },
    play,
    pause,
    dispose() {
      pause();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      geo.dispose();
      material.dispose();
      atlas.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
