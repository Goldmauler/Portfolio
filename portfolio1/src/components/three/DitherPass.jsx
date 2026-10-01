import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../lib/store';
import { THEMES } from '../../lib/themes';

// Raw sRGB triplet so the canvas paper color matches the CSS background exactly.
const hexToVec3 = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Ordered (Bayer 8x8) dithering into three inks: paper -> ink -> ink2.
const fragmentShader = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uInk2;
  uniform float uGlitch;
  uniform float uTime;
  varying vec2 vUv;

  float bayer2(vec2 a) {
    a = floor(a);
    return fract(dot(a, vec2(0.5, a.y * 0.75)));
  }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    // Horizontal tearing when the scene "glitches".
    if (uGlitch > 0.0) {
      float band = floor(uv.y * 24.0 + floor(uTime * 18.0));
      float shift = (hash(band) - 0.5) * 0.08 * uGlitch * step(0.6, hash(band + 3.1));
      uv.x = fract(uv.x + shift);
    }

    vec3 c = texture2D(tScene, uv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    l = pow(clamp(l, 0.0, 1.0), 0.4545);
    l = clamp((l - 0.035) * 1.3, 0.0, 1.0);

    float t = bayer8(gl_FragCoord.xy) + 0.5 / 64.0;
    vec3 col;
    if (l < 0.6) {
      col = (l / 0.6) > t ? uInk : uPaper;
    } else {
      col = ((l - 0.6) / 0.4) > t ? uInk2 : uInk;
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Takes over rendering (useFrame priority 1): draws the scene into a render
 * target, then dithers it to the screen through a full-screen triangle.
 */
export default function DitherPass({ glitchRef }) {
  const { gl, size, viewport } = useThree();
  const theme = useStore((s) => s.theme);

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        depthBuffer: true,
        stencilBuffer: false,
      }),
    [],
  );

  const pass = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tScene: { value: target.texture },
        uPaper: { value: new THREE.Vector3() },
        uInk: { value: new THREE.Vector3() },
        uInk2: { value: new THREE.Vector3() },
        uGlitch: { value: 0 },
        uTime: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    });
    // One oversized triangle covers the screen with no diagonal seam.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    return { material, geometry, scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [target]);

  useEffect(() => {
    const t = THEMES[theme] || THEMES.phosphor;
    pass.material.uniforms.uPaper.value.copy(hexToVec3(t.bg));
    pass.material.uniforms.uInk.value.copy(hexToVec3(t.ink));
    pass.material.uniforms.uInk2.value.copy(hexToVec3(t.ink2));
  }, [theme, pass]);

  useEffect(() => {
    const v = gl.getDrawingBufferSize(new THREE.Vector2());
    target.setSize(v.x, v.y);
  }, [gl, target, size.width, size.height, viewport.dpr]);

  useEffect(
    () => () => {
      target.dispose();
      pass.material.dispose();
      pass.geometry.dispose();
    },
    [target, pass],
  );

  useFrame((state) => {
    const u = pass.material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uGlitch.value = glitchRef?.current ?? 0;
    state.gl.setRenderTarget(target);
    state.gl.render(state.scene, state.camera);
    state.gl.setRenderTarget(null);
    state.gl.render(pass.scene, pass.camera);
  }, 1);

  return null;
}
