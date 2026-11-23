/**
 * SkyLayer.js - Procedural night sky
 *
 * Three cheap pieces drawn straight in clip space (no camera math):
 *  - a nebula, generated once into a small texture and then just sampled
 *  - the star field, one draw call of GL points that twinkle in the shader
 *  - an occasional shooting star
 *
 * The sky drifts slightly with scroll, and stars near the pointer brighten.
 */
import * as THREE from 'three';
import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling';
import { NOISE, rng } from '../glsl.js';
import { input } from '../input.js';

// All sky pieces sit at the far plane so clouds and asteroids draw over them
const FAR_Z = '0.9995';

const NEBULA_BAKE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform vec3 uSeed;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
${NOISE}
void main() {
  vec3 p = vec3(vUv * 2.6, 0.0) + uSeed;
  // Domain-warped fbm gives the wispy, folded look
  vec3 w = vec3(fbm(p + vec3(0.0, 1.3, 4.1)), fbm(p + vec3(5.2, 2.7, 1.9)), 0.0);
  float n = fbm(p + 1.6 * w);
  float m = fbm(p * 0.7 + vec3(9.0, 3.0, 2.0) + 0.8 * w);
  float a = smoothstep(0.42, 0.78, n);
  float b = smoothstep(0.45, 0.80, m);
  float c = smoothstep(0.50, 0.85, fbm(p * 1.3 + vec3(2.0, 8.0, 5.0)));
  vec3 col = uColA * a * 0.55 + uColB * b * 0.5 + uColC * c * a * 0.6;
  // Fade toward the texture edge so parallax never shows a seam
  vec2 e = smoothstep(0.0, 0.18, vUv) * smoothstep(1.0, 0.82, vUv);
  gl_FragColor = vec4(col * e.x * e.y, 1.0);
}
`;

const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const NEBULA_VERT = /* glsl */`
varying vec2 vSt;
varying float vX;
uniform vec2 uView;
uniform vec2 uShift;
void main() {
  vX = position.x * 0.5 + 0.5;
  // Square "sky space" covering the longer screen side, so the nebula never stretches
  vSt = (position.xy / uView) * 0.36 + 0.5 + uShift;
  gl_Position = vec4(position.xy, ${FAR_Z}, 1.0);
}
`;

const NEBULA_FRAG = /* glsl */`
precision highp float;
varying vec2 vSt;
varying float vX;
uniform sampler2D uMap;
uniform float uStrength;
void main() {
  // The sky brightens toward the right edge of the screen
  float right = smoothstep(0.0, 1.0, vX);
  vec3 col = texture2D(uMap, vSt).rgb * uStrength * mix(0.5, 2.6, right);
  col += vec3(0.014, 0.042, 0.088) * right * right;
  gl_FragColor = vec4(col, 1.0);
}
`;

const STAR_VERT = /* glsl */`
attribute vec2 aPos;
attribute float aSize;
attribute float aDepth;
attribute float aPhase;
attribute float aBright;
attribute float aTwinkle;
attribute float aHalo;
attribute vec3 aTint;
uniform vec2 uView;
uniform float uScroll;
uniform float uTime;
uniform float uPx;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uAspect;
uniform vec2 uRes;
uniform vec2 uHole;
uniform float uHoleR;
varying float vBright;
varying float vHalo;
varying vec3 vTint;
void main() {
  vec2 p = aPos;
  p.y += uScroll * aDepth;
  p = mod(p + 1.0, 2.0) - 1.0;
  vec2 clip = p * uView;

  float tw = 1.0 + aTwinkle * sin(uTime * (0.5 + aPhase) + aPhase * 40.0);

  // Stars near the pointer wake up a little
  vec2 d = clip - uPointer;
  d.x *= uAspect;
  float near = uPointerOn * smoothstep(0.34, 0.0, length(d));

  // Gravitational lensing: starlight bends around the black hole, so each
  // star appears pushed outward from it and brightens as it nears the ring
  float mag = 1.0;
  if (uHoleR > 0.0) {
    vec2 px = (clip - uHole) * uRes * 0.5;
    float r = max(length(px), 0.001);
    float image = 0.5 * (r + sqrt(r * r + 4.0 * uHoleR * uHoleR));
    clip = uHole + (px / r) * image / (uRes * 0.5);
    float un = r / uHoleR;
    mag = min(2.6, (un * un + 2.0) / (un * sqrt(un * un + 4.0)));
  }

  vBright = (aBright * tw + near * 0.9) * mag;
  vHalo = aHalo;
  vTint = aTint;
  gl_PointSize = aSize * uPx * (1.0 + near * 0.6);
  gl_Position = vec4(clip, ${FAR_Z}, 1.0);
}
`;

const STAR_FRAG = /* glsl */`
precision highp float;
varying float vBright;
varying float vHalo;
varying vec3 vTint;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float core = mix(smoothstep(1.0, 0.45, r), smoothstep(0.36, 0.2, r), vHalo);
  float glow = vHalo * pow(max(0.0, 1.0 - r), 2.0) * 0.28;
  float a = (core + glow) * vBright;
  gl_FragColor = vec4(vTint * a, 1.0);
}
`;

const STREAK_VERT = /* glsl */`
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uWidth;
uniform float uAspect;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec2 dir = uTo - uFrom;
  vec2 dpx = dir * vec2(uAspect, 1.0);
  vec2 npx = normalize(vec2(-dpx.y, dpx.x));
  vec2 p = mix(uFrom, uTo, uv.x) + npx * (uv.y - 0.5) * uWidth * vec2(1.0 / uAspect, 1.0);
  gl_Position = vec4(p, ${FAR_Z}, 1.0);
}
`;

const STREAK_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uAlpha;
void main() {
  float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
  float tail = pow(vUv.x, 2.2);
  float head = smoothstep(0.92, 1.0, vUv.x);
  float a = (tail * pow(across, 1.5) + head * across) * uAlpha;
  gl_FragColor = vec4(vec3(0.85, 0.93, 1.0) * a, 1.0);
}
`;

const additive = {
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: true,
};

export function createSkyLayer(options = {}) {
  const seed = options.seed ?? 1;
  const hole = options.hole ?? null;
  const random = rng(seed);

  return {
    time: 0,
    nextStreak: 4 + random() * 6,
    streakLife: -1,

    setup(scene, camera, renderer) {
      this.scene = scene;
      this._bakeNebula(renderer);
      this._createNebula(scene);
      this._createStars(scene, renderer);
      this._createStreak(scene);
      this.onResize(window.innerWidth, window.innerHeight, camera, renderer);
    },

    /** Render the nebula once into a small texture; afterwards it costs one texture lookup per pixel */
    _bakeNebula(renderer) {
      const size = input.small ? 256 : 512;
      this.nebulaTarget = new THREE.WebGLRenderTarget(size, size, { depthBuffer: false });
      // Fixed colors and shape: the sky looks the same on every visit
      const pal = [0x1d4f8c, 0x4b2f8f, 0x1f7a80];
      const material = new THREE.ShaderMaterial({
        vertexShader: QUAD_VERT,
        fragmentShader: NEBULA_BAKE_FRAG,
        uniforms: {
          uSeed: { value: new THREE.Vector3(11.3, 27.9, 4.6) },
          uColA: { value: new THREE.Color(pal[0]) },
          uColB: { value: new THREE.Color(pal[1]) },
          uColC: { value: new THREE.Color(pal[2]) },
        },
        depthTest: false,
      });
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      const bakeScene = new THREE.Scene();
      bakeScene.add(quad);
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(this.nebulaTarget);
      renderer.render(bakeScene, new THREE.Camera());
      renderer.setRenderTarget(prev);
      quad.geometry.dispose();
      material.dispose();
    },

    _createNebula(scene) {
      this.nebulaMaterial = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: {
          uMap: { value: this.nebulaTarget.texture },
          uView: { value: new THREE.Vector2(1, 1) },
          uShift: { value: new THREE.Vector2() },
          uStrength: { value: 0.45 },
        },
        ...additive,
      });
      this.nebula = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.nebulaMaterial);
      this.nebula.frustumCulled = false;
      this.nebula.renderOrder = -10;
      scene.add(this.nebula);
    },

    _createStars(scene, renderer) {
      // Poisson disk sampling keeps the field even, with no clumps or holes
      const span = 100;
      const pds = new FastPoissonDiskSampling({
        shape: [span, span],
        radius: input.small ? 3.4 : 2.5,
        tries: 20,
      }, random);
      const points = pds.fill();
      const count = points.length;

      const aPos = new Float32Array(count * 2);
      const aSize = new Float32Array(count);
      const aDepth = new Float32Array(count);
      const aPhase = new Float32Array(count);
      const aBright = new Float32Array(count);
      const aTwinkle = new Float32Array(count);
      const aHalo = new Float32Array(count);
      const aTint = new Float32Array(count * 3);
      const tints = [
        [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0],
        [0.80, 0.88, 1.0], [0.72, 0.84, 1.0], [1.0, 0.92, 0.80],
      ];

      for (let i = 0; i < count; i++) {
        aPos[i * 2] = (points[i][0] / span) * 2 - 1;
        aPos[i * 2 + 1] = (points[i][1] / span) * 2 - 1;

        // Most stars are small and far; a few are near, big and haloed
        const near = Math.pow(random(), 2.2);
        const halo = near > 0.72 && random() < 0.55 ? 1 : 0;
        aDepth[i] = 0.02 + near * 0.08;
        aSize[i] = halo ? 7 + random() * 4 : 1.4 + near * 1.8;
        aBright[i] = 0.45 + near * 0.55 + random() * 0.2;
        aTwinkle[i] = random() < 0.35 ? 0.15 + random() * 0.3 : 0.04;
        aPhase[i] = random();
        aHalo[i] = halo;
        const tint = tints[Math.floor(random() * tints.length)];
        aTint.set(tint, i * 3);
      }

      const geometry = new THREE.BufferGeometry();
      // three.js wants a position attribute for bookkeeping; the shader ignores it
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute('aPos', new THREE.BufferAttribute(aPos, 2));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
      geometry.setAttribute('aDepth', new THREE.BufferAttribute(aDepth, 1));
      geometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
      geometry.setAttribute('aBright', new THREE.BufferAttribute(aBright, 1));
      geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(aTwinkle, 1));
      geometry.setAttribute('aHalo', new THREE.BufferAttribute(aHalo, 1));
      geometry.setAttribute('aTint', new THREE.BufferAttribute(aTint, 3));

      this.starMaterial = new THREE.ShaderMaterial({
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        uniforms: {
          uView: { value: new THREE.Vector2(1, 1) },
          uScroll: { value: 0 },
          uTime: { value: 0 },
          uPx: { value: renderer.getPixelRatio() },
          uPointer: { value: new THREE.Vector2() },
          uPointerOn: { value: 0 },
          uAspect: { value: 1 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uHole: { value: new THREE.Vector2() },
          uHoleR: { value: 0 },
        },
        ...additive,
      });
      this.stars = new THREE.Points(geometry, this.starMaterial);
      this.stars.frustumCulled = false;
      this.stars.renderOrder = -9;
      this.starCount = count;
      scene.add(this.stars);
    },

    _createStreak(scene) {
      this.streakMaterial = new THREE.ShaderMaterial({
        vertexShader: STREAK_VERT,
        fragmentShader: STREAK_FRAG,
        uniforms: {
          uFrom: { value: new THREE.Vector2() },
          uTo: { value: new THREE.Vector2() },
          uWidth: { value: 0.006 },
          uAspect: { value: 1 },
          uAlpha: { value: 0 },
        },
        ...additive,
      });
      this.streak = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.streakMaterial);
      this.streak.frustumCulled = false;
      this.streak.renderOrder = -8;
      this.streak.visible = false;
      scene.add(this.streak);
    },

    _launchStreak() {
      // Start somewhere in the upper sky, travel down and across
      const x = -0.9 + random() * 1.8;
      const y = 0.25 + random() * 0.7;
      const dir = random() < 0.5 ? -1 : 1;
      const len = 0.35 + random() * 0.3;
      this.streakStart = new THREE.Vector2(x, y);
      this.streakVel = new THREE.Vector2(dir * len * 1.4, -len * (0.5 + random() * 0.5));
      this.streakLife = 0;
      this.streak.visible = true;
      this.host?.boost(0.9);
    },

    update(scene, camera, renderer, delta) {
      this.time += delta;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const span = Math.max(w, h);
      const still = input.reduced;

      const scroll = still ? 0 : (input.scroll / span) * 2;
      const u = this.starMaterial.uniforms;
      u.uTime.value = still ? 0 : this.time;
      u.uScroll.value = scroll;
      u.uPointer.value.set(input.tx, input.ty);
      u.uPointerOn.value = input.pointerOn;
      if (hole) {
        u.uHole.value.set((hole.center.x / w) * 2 - 1, -((hole.center.y / h) * 2 - 1));
        u.uHoleR.value = hole.radius;
        u.uRes.value.set(w, h);
      }

      this.nebulaMaterial.uniforms.uShift.value.set(0, still ? 0 : scroll * 0.012);

      if (still) return;

      // Shooting stars
      if (this.streakLife < 0) {
        this.nextStreak -= delta;
        if (this.nextStreak <= 0) {
          this._launchStreak();
          this.nextStreak = 7 + random() * 11;
        }
      } else {
        this.streakLife += delta;
        const t = this.streakLife / 0.75;
        if (t >= 1) {
          this.streakLife = -1;
          this.streak.visible = false;
        } else {
          const su = this.streakMaterial.uniforms;
          const head = Math.min(1, t * 1.25);
          const tail = Math.max(0, head - 0.38);
          su.uTo.value.copy(this.streakStart).addScaledVector(this.streakVel, head);
          su.uFrom.value.copy(this.streakStart).addScaledVector(this.streakVel, tail);
          su.uAlpha.value = Math.sin(Math.PI * Math.min(1, t)) * 0.9;
        }
      }
    },

    onResize(width, height, camera, renderer) {
      const span = Math.max(width, height);
      const view = new THREE.Vector2(span / width, span / height);
      this.starMaterial.uniforms.uView.value.copy(view);
      this.starMaterial.uniforms.uAspect.value = width / height;
      this.starMaterial.uniforms.uPx.value = renderer.getPixelRatio();
      this.nebulaMaterial.uniforms.uView.value.copy(view);
      this.streakMaterial.uniforms.uAspect.value = width / height;
    },

    dispose(scene) {
      [this.nebula, this.stars, this.streak].forEach((obj) => {
        if (!obj) return;
        obj.geometry.dispose();
        obj.material.dispose();
        scene.remove(obj);
      });
      this.nebulaTarget?.dispose();
    },
  };
}
