import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Real-time rendered Infinity Stones. Faceted physical-material gems with a
// glowing core, lit by a studio environment map so the facets catch light.

export const STONE_COLORS = {
  time: '#15e36f',
  space: '#2b78ff',
  power: '#9a2cff',
  reality: '#ff1e38',
  soul: '#ff7410',
  mind: '#ffcf14',
};

/** A gem mesh (unit radius). Shared by the sprite renderer and the 3D gauntlet. */
export function makeGem(color, { facets = 12, cut = 0.72 } = {}) {
  const c = new THREE.Color(color);
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.6, 1),
    new THREE.MeshBasicMaterial({ color: c.clone().lerp(new THREE.Color('#ffffff'), 0.5), transparent: true, opacity: 0.95 }),
  );
  core.renderOrder = 1;
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1, facets, Math.round(facets * 0.75)),
    new THREE.MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.28,
      roughness: 0.05,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      iridescence: 0.45,
      iridescenceIOR: 1.7,
      specularIntensity: 1,
      transparent: true,
      opacity: 0.86,
      flatShading: true,
      depthWrite: false,
    }),
  );
  shell.renderOrder = 2;
  group.add(core, shell);
  group.scale.set(1, 1.1, cut);
  group.userData.dispose = () => {
    core.geometry.dispose();
    core.material.dispose();
    shell.geometry.dispose();
    shell.material.dispose();
  };
  return group;
}

/** Soft radial halo texture for additive glow sprites. */
let haloTex = null;
export function haloTexture() {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  haloTex = new THREE.CanvasTexture(c);
  haloTex.colorSpace = THREE.SRGBColorSpace;
  return haloTex;
}

function withRig(size, fn) {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 4.9);
  const key = new THREE.DirectionalLight('#ffffff', 2.4);
  key.position.set(-2, 3, 4);
  const rim = new THREE.PointLight('#ffffff', 30, 10);
  rim.position.set(2.2, -1.2, 1.6);
  scene.add(key, rim);
  try {
    return fn({ renderer, scene, camera });
  } finally {
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
}

const cache = new Map();

/**
 * Renders a gem as a horizontal sprite sheet (a slow turntable spin) and
 * returns a data URL. Results are cached per stone/size/frames.
 */
export function gemSheet(id = 'time', { size = 96, frames = 24 } = {}) {
  const key = `${id}:${size}:${frames}`;
  if (cache.has(key)) return cache.get(key);
  const url = withRig(size, ({ renderer, scene, camera }) => {
    const gem = makeGem(STONE_COLORS[id]);
    scene.add(gem);
    const sheet = document.createElement('canvas');
    sheet.width = size * frames;
    sheet.height = size;
    const ctx = sheet.getContext('2d');
    for (let f = 0; f < frames; f++) {
      const a = (f / frames) * Math.PI * 2;
      gem.rotation.set(0.28 + Math.sin(a) * 0.08, Math.sin(a) * 0.65, Math.cos(a) * 0.06);
      renderer.render(scene, camera);
      ctx.drawImage(renderer.domElement, f * size, 0);
    }
    gem.userData.dispose();
    return sheet.toDataURL('image/png');
  });
  cache.set(key, url);
  return url;
}

/** A single hero render of a gem (for the Eye of Agamotto). */
export function gemStill(id = 'time', size = 256) {
  return gemSheet(id, { size, frames: 1 });
}
