/**
 * PlanetLayer.js - A procedural planet, different on every visit
 *
 * The whole planet is one small quad with a fragment shader: noise-built
 * terrain, cel-shaded lighting to match the clouds, an atmosphere rim, and
 * rings on the gas giants. Hit it with a laser and a new world rolls in.
 *
 * Every visit starts on the same moon. Start elsewhere with ?planet=ocean|giant|desert.
 */
import * as THREE from 'three';
import { NOISE, rng } from '../glsl.js';
import { input } from '../input.js';

// Quad half-extent in planet radii (room for rings and atmosphere)
const EXT = 2.3;

const VERT = /* glsl */`
uniform vec2 uCenter;
uniform vec2 uHalf;
varying vec2 vUv;
void main() {
  vUv = position.xy * ${EXT.toFixed(1)};
  gl_Position = vec4(uCenter + position.xy * uHalf, 0.999, 1.0);
}
`;

const FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uType;
uniform float uRing;
uniform float uTime;
uniform float uSpin;
uniform float uTilt;
uniform float uAA;
uniform float uFlash;
uniform float uScale;
uniform vec3 uSeed;
uniform vec3 uLight;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform vec3 uAtmo;
${NOISE}

vec3 surface(vec3 p, vec3 q) {
  if (uType < 0.5) {
    // Ocean world: seas, coast, land, peaks, ice caps, drifting cloud
    float h = fbm(q * 1.9);
    vec3 sea = mix(uA * 0.72, uA, smoothstep(0.30, 0.50, h));
    vec3 land = mix(uC, uB, smoothstep(0.52, 0.57, h));
    land = mix(land, vec3(0.86, 0.87, 0.90), smoothstep(0.66, 0.70, h));
    vec3 col = mix(sea, land, smoothstep(0.515, 0.525, h));
    float cap = smoothstep(0.78, 0.82, abs(p.y) + 0.10 * noise3(q * 5.0));
    col = mix(col, vec3(0.93, 0.95, 0.98), cap);
    float cl = fbm(q * 3.1 + vec3(uTime * 0.012, 0.0, 0.0));
    return mix(col, vec3(0.96), smoothstep(0.585, 0.615, cl) * 0.9);
  }
  if (uType < 1.5) {
    // Gas giant: turbulent latitude bands and one storm
    float y = p.y + 0.10 * (fbm(q * vec3(1.5, 5.0, 1.5)) - 0.5);
    float b = sin(y * 10.0) * 0.5 + 0.5;
    b = smoothstep(0.30, 0.38, b) * 0.5 + smoothstep(0.66, 0.74, b) * 0.5;
    vec3 col = mix(uA, uB, b);
    float s = sin(y * 23.0 + 1.3);
    col = mix(col, uC, smoothstep(0.82, 0.90, s) * 0.55);
    vec2 sp = vec2(atan(p.x, p.z) - 0.6, (p.y + 0.32) * 3.2);
    col = mix(col, uC, smoothstep(0.34, 0.26, length(sp)));
    return col;
  }
  if (uType < 2.5) {
    // Moon: pale highlands, dark maria, crater rims
    float h = fbm(q * 2.3);
    vec3 col = mix(uA, uB, smoothstep(0.49, 0.52, h));
    float c = noise3(q * 6.5);
    col = mix(col, uC, smoothstep(0.71, 0.73, c));
    col = mix(col, uA * 1.08, smoothstep(0.022, 0.0, abs(c - 0.70)));
    return col;
  }
  // Desert world: dunes, dark canyons, small caps
  float h = fbm(q * 2.1);
  vec3 col = mix(uA, uB, smoothstep(0.40, 0.60, h));
  float canyon = abs(noise3(q * 4.5) - 0.5);
  col = mix(col, uC, smoothstep(0.035, 0.015, canyon));
  float cap = smoothstep(0.86, 0.89, abs(p.y) + 0.06 * noise3(q * 6.0));
  return mix(col, vec3(0.95, 0.93, 0.92), cap);
}

void main() {
  vec2 uv = vUv / max(uScale, 0.001);
  float r = length(uv);
  vec2 lightDir2 = normalize(uLight.xy);

  // Body, premultiplied
  vec3 body = vec3(0.0);
  float bodyA = 0.0;
  if (r < 1.0 + uAA) {
    float z = sqrt(max(0.0, 1.0 - r * r));
    vec3 n = vec3(uv, z);
    vec3 p = n;
    p.xy = rot2(uTilt) * p.xy;
    p.xz = rot2(uTime * uSpin) * p.xz;
    vec3 base = surface(p, p + uSeed);

    // Cel shading: night, mid, and day bands like the clouds
    float l = dot(n, uLight);
    float lit = 0.30 + 0.38 * smoothstep(-0.03, 0.03, l) + 0.32 * smoothstep(0.36, 0.42, l);
    vec3 night = vec3(0.04, 0.08, 0.13);
    vec3 col = base * lit + night * (1.0 - lit) * 0.6;
    float fres = pow(1.0 - z, 3.0);
    col += uAtmo * fres * 0.55 * smoothstep(-0.2, 0.4, l);
    col += vec3(1.0) * uFlash * (0.35 + fres);

    bodyA = smoothstep(1.0 + uAA, 1.0 - uAA, r);
    body = col * bodyA;
  }

  // Atmosphere glow outside the limb, brighter on the lit side
  float g = pow(clamp(1.0 - (r - 1.0) / 0.20, 0.0, 1.0), 2.5) * step(1.0, r);
  g *= 0.30 * (0.35 + 0.65 * smoothstep(-0.6, 0.5, dot(uv / max(r, 0.001), lightDir2)));
  vec3 outRgb = body + uAtmo * g * (1.0 - bodyA) * (1.0 + uFlash * 3.0);
  float outA = bodyA + g * (1.0 - bodyA);

  // Rings: intersect the view ray with a tilted plane through the planet
  if (uRing > 0.5) {
    vec3 nr = normalize(vec3(-0.28, 0.90, 0.32));
    vec2 ruv = rot2(-uTilt) * uv;
    float zq = -(nr.x * ruv.x + nr.y * ruv.y) / nr.z;
    float rq = length(vec3(ruv, zq));
    float band = smoothstep(1.38, 1.44, rq) * smoothstep(2.12, 2.06, rq);
    band *= 1.0 - 0.85 * smoothstep(0.03, 0.0, abs(rq - 1.74));
    band *= 0.62 + 0.38 * step(0.5, fract(rq * 7.0));
    float inFront = step(0.0, zq);
    float ringA = band * 0.82 * mix(1.0 - bodyA, 1.0, inFront);
    // The planet's shadow falls across the far side of the ring
    float shade = mix(0.55, 1.0, smoothstep(-0.2, 0.5, dot(normalize(ruv), lightDir2)));
    vec3 ringCol = mix(uB, uC, 0.35) * shade * 1.05;
    outRgb = outRgb * (1.0 - ringA) + ringCol * ringA;
    outA = outA * (1.0 - ringA) + ringA;
  }

  gl_FragColor = vec4(outRgb, outA);
}
`;

// type: 0 ocean, 1 giant, 2 moon, 3 desert. Colors: A, B, C, atmosphere
const WORLDS = {
  ocean: [
    { type: 0, colors: [0x2b83bd, 0x74b27c, 0xd9c690, 0x7fc4ff] },
    { type: 0, colors: [0x2a9d9a, 0xb7c97a, 0xe6d3a0, 0x8fe8e0] },
    { type: 0, colors: [0x4a6fd0, 0xc98bb8, 0xf0d6c0, 0xb4a4ff] },
  ],
  giant: [
    { type: 1, colors: [0xe6cfa8, 0xc8946a, 0xa85c3c, 0xf3d9b0], ring: true },
    { type: 1, colors: [0x7fb4e6, 0x4f86d6, 0xdcefff, 0x9fd0ff], ring: false },
    { type: 1, colors: [0xd9c2ee, 0xa98bd6, 0xf4e6ff, 0xd8c0ff], ring: true },
    { type: 1, colors: [0xa9e0cf, 0x5fb7a8, 0xf0fff6, 0xa8f0dc], ring: true },
  ],
  moon: [
    { type: 2, colors: [0xcfc9dc, 0x9a93ae, 0x7d7693, 0xdcd6f0] },
    { type: 2, colors: [0xe2d8c8, 0xb5a690, 0x94846f, 0xf0e6d6] },
  ],
  desert: [
    { type: 3, colors: [0xd88a55, 0xb9583a, 0x6e2c22, 0xffb48a] },
    { type: 3, colors: [0xe0b46a, 0xc98a4a, 0x7a4a2a, 0xffd89a] },
  ],
};
const KINDS = Object.keys(WORLDS);

export function createPlanetLayer(options = {}) {
  let random = rng(options.seed ?? 1);
  // Every visit starts on the same moon. A laser hit rolls a random world.
  let forcedKind = KINDS.includes(options.kind) ? options.kind : 'moon';
  let first = !KINDS.includes(options.kind);

  return {
    time: 0,
    // Regeneration: -1 idle, otherwise 0..1 progress
    swap: -1,
    swapped: false,
    center: new THREE.Vector2(),
    radius: 0,

    setup(scene, camera, renderer) {
      this.material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uCenter: { value: new THREE.Vector2() },
          uHalf: { value: new THREE.Vector2() },
          uType: { value: 0 },
          uRing: { value: 0 },
          uTime: { value: 0 },
          uSpin: { value: 0.03 },
          uTilt: { value: 0.3 },
          uAA: { value: 0.01 },
          uFlash: { value: 0 },
          uScale: { value: 1 },
          uSeed: { value: new THREE.Vector3() },
          uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.70).normalize() },
          uA: { value: new THREE.Color() },
          uB: { value: new THREE.Color() },
          uC: { value: new THREE.Color() },
          uAtmo: { value: new THREE.Color() },
        },
        transparent: true,
        depthWrite: false,
        // Shader outputs premultiplied color
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
      this.mesh.frustumCulled = false;
      this.mesh.renderOrder = -7;
      scene.add(this.mesh);
      this._generate();
      this._layout();
    },

    /** Roll a new world */
    _generate() {
      const kind = forcedKind ?? KINDS[Math.floor(random() * KINDS.length)];
      forcedKind = null;
      const variants = WORLDS[kind];
      const world = first ? variants[0] : variants[Math.floor(random() * variants.length)];
      const u = this.material.uniforms;
      // Colors are authored as display values and written unconverted by the shader
      const set = (uniform, hex) => uniform.value.setHex(hex, THREE.LinearSRGBColorSpace);
      set(u.uA, world.colors[0]);
      set(u.uB, world.colors[1]);
      set(u.uC, world.colors[2]);
      set(u.uAtmo, world.colors[3]);
      u.uType.value = world.type;
      // Rings need room; phones show the planet as a limb at the screen edge
      u.uRing.value = world.ring && !input.small ? 1 : 0;
      if (first) {
        u.uSeed.value.set(7.3, 21.4, 12.8);
        u.uTilt.value = 0.22;
        u.uSpin.value = 0.025;
        first = false;
      } else {
        u.uSeed.value.set(random() * 40, random() * 40, random() * 40);
        u.uTilt.value = (random() - 0.5) * 0.9;
        u.uSpin.value = (world.type === 1 ? 0.05 : 0.025) * (random() < 0.5 ? -1 : 1);
      }
      this.kind = kind;
      this.sizeMult = input.small ? 1 : world.type === 2 ? 0.72 : world.type === 1 ? 1.0 : 0.86;
    },

    /** Where the planet sits: right margin on desktop, leaning in from the edge on phones */
    _layout() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768) {
        // Phones have almost no open sky beside the cards, so the planet is a
        // large limb leaning in from the right edge
        this.baseRadius = Math.max(56, Math.min(84, w * 0.17));
        this.edgeInset = [-0.3, -0.3];
        this.baseY = h * 0.47;
        this.scrollFactor = 0.03;
      } else {
        this.baseRadius = Math.max(64, Math.min(120, w * 0.064));
        this.edgeInset = [1.7, 2.25];
        this.baseY = h * 0.44;
        this.scrollFactor = 0.05;
      }
    },

    /** Screen-space hit test, used by the laser layer */
    hitTest(clientX, clientY, slop = 0) {
      const dx = clientX - this.center.x;
      const dy = clientY - this.center.y;
      return dx * dx + dy * dy < (this.radius + slop) * (this.radius + slop);
    },

    /** Laser impact: flash, collapse, and bring in a new world */
    regenerate() {
      if (this.swap >= 0) return;
      this.swap = 0;
      this.swapped = false;
      this.host?.boost(1.2);
    },

    update(scene, camera, renderer, delta) {
      const still = input.reduced;
      if (!still) this.time += delta;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const u = this.material.uniforms;

      // Regeneration: shrink with a flash, swap, spring back
      let scale = 1;
      let flash = 0;
      if (this.swap >= 0) {
        this.swap += delta / 1.05;
        const t = this.swap;
        if (t < 0.4) {
          const k = t / 0.4;
          scale = 1 - k * k * k;
          flash = Math.min(1, k * 2.5);
        } else {
          if (!this.swapped) {
            this._generate();
            this.swapped = true;
          }
          const k = Math.min(1, (t - 0.4) / 0.6);
          // Exponential ease-out with a hint of overshoot
          scale = 1 - Math.pow(2, -9 * k) * Math.cos(k * 5.5);
          flash = Math.max(0, 1 - k * 3);
        }
        if (t >= 1) this.swap = -1;
      }

      const radius = this.baseRadius * this.sizeMult;
      // Ringed worlds sit further in so the rings clear the screen edge
      const inset = this.edgeInset[u.uRing.value > 0.5 ? 1 : 0];
      const cx = w - this.baseRadius * inset - (still ? 0 : input.px * 7);
      const cy = this.baseY - (still ? 0 : input.scroll * this.scrollFactor) + (still ? 0 : input.py * 7);
      this.center.set(cx, cy);
      this.radius = radius * Math.max(scale, 0.3);

      u.uCenter.value.set((cx / w) * 2 - 1, -((cy / h) * 2 - 1));
      u.uHalf.value.set((radius * EXT * 2) / w, (radius * EXT * 2) / h);
      u.uAA.value = 1.5 / radius;
      u.uTime.value = this.time;
      u.uScale.value = scale;
      u.uFlash.value = flash;

      // Nothing to draw once it has scrolled well off the top
      this.mesh.visible = cy > -radius * EXT;
    },

    onResize() {
      this._layout();
    },

    dispose(scene) {
      this.mesh.geometry.dispose();
      this.material.dispose();
      scene.remove(this.mesh);
    },
  };
}
