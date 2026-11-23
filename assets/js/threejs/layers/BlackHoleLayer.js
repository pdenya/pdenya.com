/**
 * BlackHoleLayer.js - A black hole in the sky at the bottom of the home page
 *
 * The accretion disk is real geometry: thousands of points on Keplerian
 * orbits, placed entirely in the vertex shader (no per-frame CPU work).
 * The famous halo over the top is not painted on. Light from the far side of
 * the disk is bent with the point-lens equation, so the arc appears on its
 * own, the same way it does in the physics. The star field uses the same
 * equation, which is why stars slide around the hole as it moves.
 *
 * Feed it a laser and it flares.
 */
import * as THREE from 'three';
import { NOISE, rng } from '../glsl.js';
import { input } from '../input.js';

// Disk extent, in Einstein radii
const INNER = 1.65;
const OUTER = 4.7;
// Shadow radius, in Einstein radii
const SHADOW = 0.8;

const DISK_VERT = /* glsl */`
attribute float aR;
attribute float aA;
attribute float aH;
attribute float aSeed;
uniform vec2 uCenter;
uniform vec2 uUnit;
uniform float uTime;
uniform float uInc;
uniform float uRoll;
uniform float uPass;
uniform float uPx;
uniform float uSize;
uniform float uAlpha;
uniform float uFlare;
varying vec3 vCol;
varying float vA;

void main() {
  // Kepler: inner orbits run faster
  float ang = aA + uTime * 0.85 * pow(aR, -1.5);
  // A flare sends a ripple out through the disk
  float rr = aR * (1.0 + 0.045 * uFlare * sin(aR * 7.0 - (1.0 - uFlare) * 14.0));
  vec3 q = vec3(cos(ang) * rr, aH, sin(ang) * rr);

  // Tilt the disk toward the viewer
  float ci = cos(uInc);
  float si = sin(uInc);
  vec2 s = vec2(q.x, q.y * ci + q.z * si);
  float depth = q.z * ci - q.y * si;
  bool behind = depth > 0.0;

  float alpha = 1.0;
  if (uPass < 1.5) {
    // Far side of the disk: its light bends around the hole.
    // Point lens: image radius = (r +/- sqrt(r^2 + 4 e^2)) / 2
    if (!behind) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    float e = smoothstep(0.0, 2.0, depth);
    float r = max(length(s), 0.0001);
    float root = sqrt(r * r + 4.0 * e * e);
    float image = uPass < 0.5 ? 0.5 * (r + root) : 0.5 * (r - root);
    s = s / r * image;
    // The second image is fainter and fades out where the disk comes round the side
    if (uPass > 0.5) alpha = 0.6 * e;
  } else if (behind) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  float cr = cos(uRoll);
  float sr = sin(uRoll);
  s = vec2(s.x * cr - s.y * sr, s.x * sr + s.y * cr);

  // Hot white-gold near the hole, cooling to orange and then violet
  float t = (aR - ${INNER.toFixed(2)}) / ${(OUTER - INNER).toFixed(2)};
  vec3 col = mix(vec3(1.0, 0.94, 0.80), vec3(1.0, 0.55, 0.22), smoothstep(0.0, 0.45, t));
  col = mix(col, vec3(0.80, 0.30, 0.66), smoothstep(0.40, 1.0, t));
  // Doppler beaming: the side spinning toward us is brighter and bluer
  float toward = -cos(ang);
  float beam = 1.0 + 0.62 * toward;
  col = mix(col, vec3(0.86, 0.93, 1.0), max(0.0, toward) * 0.28);
  vCol = col * (0.35 + 0.65 * beam) * (1.0 + uFlare * 1.6);
  vA = alpha * uAlpha * (0.55 + 0.45 * aSeed) * (1.0 - 0.55 * smoothstep(0.75, 1.0, t));

  gl_Position = vec4(uCenter + s * uUnit, 0.999, 1.0);
  gl_PointSize = max(1.0, uPx * uSize * (0.8 + aSeed * 1.7) * (1.0 + 0.4 * uFlare));
}
`;

const DISK_FRAG = /* glsl */`
precision highp float;
varying vec3 vCol;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - r), 1.5) * vA;
  gl_FragColor = vec4(vCol * a, 1.0);
}
`;

// The glowing gas of the disk, drawn per pixel. For every pixel we ask where
// its light came from: run the lens equation backwards (source = image - e^2 / image)
// and look up the disk there. The far side lands as the arc over the top and
// the thin second image underneath; the near side is drawn straight.
const GAS_VERT = /* glsl */`
uniform vec2 uCenter;
uniform vec2 uUnit;
uniform float uRoll;
varying vec2 vL;
void main() {
  vL = position.xy * vec2(${(OUTER + 0.5).toFixed(2)}, 2.5);
  float cr = cos(uRoll);
  float sr = sin(uRoll);
  vec2 s = vec2(vL.x * cr - vL.y * sr, vL.x * sr + vL.y * cr);
  gl_Position = vec4(uCenter + s * uUnit, 0.999, 1.0);
}
`;

const GAS_FRAG = /* glsl */`
precision highp float;
varying vec2 vL;
uniform float uTime;
uniform float uInc;
uniform float uPass;
uniform float uFlare;
uniform float uGain;
uniform vec3 uSeed;
${NOISE}

vec3 disk(float x, float z) {
  float r = length(vec2(x, z));
  float t = (r - ${INNER.toFixed(2)}) / ${(OUTER - INNER).toFixed(2)};
  if (t < 0.0 || t > 1.0) return vec3(0.0);
  // Streaks sheared by differential rotation
  float a = atan(z, x) - uTime * 0.85 * pow(r, -1.5);
  float n = noise3(vec3(r * 5.0, cos(a) * 1.7, sin(a) * 1.7) + uSeed);
  float n2 = noise3(vec3(r * 13.0, cos(a) * 3.4, sin(a) * 3.4) + uSeed.zxy);
  float lanes = 0.30 + 1.05 * n * n + 0.40 * n2;
  float fall = pow(1.0 - t, 1.45) * smoothstep(0.0, 0.05, t);
  vec3 col = mix(vec3(1.0, 0.92, 0.76), vec3(1.0, 0.50, 0.16), smoothstep(0.0, 0.38, t));
  col = mix(col, vec3(0.80, 0.24, 0.60), smoothstep(0.32, 0.92, t));
  // Doppler beaming
  float toward = -x / r;
  float beam = 1.0 + 0.6 * toward;
  col = mix(col, vec3(0.90, 0.95, 1.0), max(0.0, toward) * 0.22);
  return col * fall * lanes * pow(beam, 1.5);
}

void main() {
  float si = sin(uInc);
  float ci = cos(uInc);
  vec3 col = vec3(0.0);
  if (uPass > 0.5) {
    // Near side: no bending
    float z = vL.y / si;
    if (z < 0.0) col = disk(vL.x, z);
  } else {
    float rho2 = max(dot(vL, vL), 0.0001);
    // The bend grows with how far behind the hole the source is; a few
    // fixed-point rounds settle it
    float e = 1.0;
    vec2 b = vL;
    float z = 0.0;
    for (int i = 0; i < 4; i++) {
      b = vL * (1.0 - e * e / rho2);
      z = b.y / si;
      e = smoothstep(0.0, 2.0, z * ci);
    }
    if (z > 0.0) {
      float inside = step(rho2, e * e);
      float k = e * e / rho2;
      float mag = min(3.0, 1.0 / max(abs(1.0 - k * k), 0.3));
      col = disk(b.x, z) * mix(1.0, 0.65, inside) * sqrt(mag);
    }
  }
  // Soft shoulder so the hot inner edge rolls off to white instead of clipping
  col = vec3(1.0) - exp(-col * uGain * (1.0 + uFlare * 1.5) * 1.5);
  gl_FragColor = vec4(col, 1.0);
}
`;

const SHADOW_VERT = /* glsl */`
uniform vec2 uCenter;
uniform vec2 uUnit;
varying vec2 vUv;
void main() {
  vUv = position.xy * 2.2;
  gl_Position = vec4(uCenter + vUv * uUnit, 0.999, 1.0);
}
`;

const SHADOW_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uAA;
uniform float uFlare;
uniform float uGlow;
void main() {
  float r = length(vUv);
  float shadow = smoothstep(${SHADOW.toFixed(2)} + uAA, ${SHADOW.toFixed(2)} - uAA, r);
  // Photon ring hugging the shadow, plus a soft corona
  float ring = exp(-pow((r - 0.86) / 0.028, 2.0)) * (0.5 + uFlare * 2.0);
  float corona = exp(-max(r - 0.8, 0.0) * 4.0) * 0.16 * (1.0 + uFlare * 2.5) * step(${SHADOW.toFixed(2)}, r);
  vec3 col = vec3(1.0, 0.86, 0.62) * (ring + corona) * uGlow;
  // Premultiplied: black where the shadow is, light added around it
  gl_FragColor = vec4(col * (1.0 - shadow), shadow);
}
`;

export function createBlackHoleLayer(options = {}) {
  const random = rng(options.seed ?? 1);

  return {
    // Screen position (CSS px) and Einstein radius (CSS px), read by other layers
    center: new THREE.Vector2(-9999, -9999),
    radius: 0,
    flareLevel: 0,
    time: random() * 100,

    setup(scene, camera, renderer) {
      const count = input.small ? 9000 : 26000;
      const aR = new Float32Array(count);
      const aA = new Float32Array(count);
      const aH = new Float32Array(count);
      const aSeed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        // Denser toward the inner edge, with a few spiral lanes for structure
        const u = Math.pow(random(), 1.7);
        const r = INNER + u * (OUTER - INNER);
        const lane = Math.sin(r * 5.2 + random() * 0.6) * 0.5 + 0.5;
        aR[i] = r + (lane - 0.5) * 0.12;
        aA[i] = random() * Math.PI * 2;
        aH[i] = (random() - 0.5) * 0.05 * r;
        aSeed[i] = random();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
      geometry.setAttribute('aA', new THREE.BufferAttribute(aA, 1));
      geometry.setAttribute('aH', new THREE.BufferAttribute(aH, 1));
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
      this.geometry = geometry;

      // Uniform objects are shared between the three disk passes
      this.uniforms = {
        uCenter: { value: new THREE.Vector2() },
        uUnit: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uInc: { value: 0.17 },
        uRoll: { value: -0.2 },
        uPx: { value: renderer.getPixelRatio() },
        uSize: { value: 1 },
        uAlpha: { value: 0.2 },
        uFlare: { value: 0 },
        uGain: { value: 0.85 },
        // One seed for both halves of the gas so the streaks join up
        uSeed: { value: new THREE.Vector3(random() * 30, random() * 30, random() * 30) },
      };
      const diskMaterial = (pass) => new THREE.ShaderMaterial({
        vertexShader: DISK_VERT,
        fragmentShader: DISK_FRAG,
        uniforms: { ...this.uniforms, uPass: { value: pass } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.shadowMaterial = new THREE.ShaderMaterial({
        vertexShader: SHADOW_VERT,
        fragmentShader: SHADOW_FRAG,
        uniforms: {
          uCenter: this.uniforms.uCenter,
          uUnit: this.uniforms.uUnit,
          uFlare: this.uniforms.uFlare,
          uAA: { value: 0.02 },
          uGlow: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });

      const gasMaterial = (pass) => new THREE.ShaderMaterial({
        vertexShader: GAS_VERT,
        fragmentShader: GAS_FRAG,
        uniforms: {
          uCenter: this.uniforms.uCenter,
          uUnit: this.uniforms.uUnit,
          uRoll: this.uniforms.uRoll,
          uTime: this.uniforms.uTime,
          uInc: this.uniforms.uInc,
          uFlare: this.uniforms.uFlare,
          uGain: this.uniforms.uGain,
          uSeed: this.uniforms.uSeed,
          uPass: { value: pass },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const quad = new THREE.PlaneGeometry(2, 2);
      this.quad = quad;

      // Far side (gas, then both lensed particle images), the shadow, then the near side across the front
      this.objects = [
        new THREE.Mesh(quad, gasMaterial(0)),
        new THREE.Points(geometry, diskMaterial(0)),
        new THREE.Points(geometry, diskMaterial(1)),
        new THREE.Mesh(quad, this.shadowMaterial),
        new THREE.Mesh(quad, gasMaterial(1)),
        new THREE.Points(geometry, diskMaterial(2)),
      ];
      this.objects.forEach((obj, i) => {
        obj.frustumCulled = false;
        obj.renderOrder = -6.6 + i * 0.05;
        scene.add(obj);
      });
    },

    /** A laser fell in */
    flare() {
      this.flareLevel = 1;
      this.host?.boost(1.5);
    },

    /** True if a screen point is inside the shadow */
    hitTest(clientX, clientY, slop = 0) {
      const r = this.radius * SHADOW + slop;
      const dx = clientX - this.center.x;
      const dy = clientY - this.center.y;
      return dx * dx + dy * dy < r * r;
    },

    update(scene, camera, renderer, delta) {
      const still = input.reduced;
      if (!still) this.time += delta;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const small = w < 768;

      // Fixed in the page, full size, in the open sky under the closing call
      // to action. Pages without that section have no black hole.
      const anchor = this.anchor ?? (this.anchor = document.querySelector('.cta-launchpad-buttons'));
      const radius = small ? Math.min(w * 0.17, 80) : Math.min(Math.min(w, h) * 0.14, 150);
      if (!anchor) {
        this.objects.forEach((obj) => { obj.visible = false; });
        this.radius = 0;
        return;
      }
      const cx = w * 0.5;
      const cy = anchor.getBoundingClientRect().bottom + radius * 1.6;
      // Skip drawing while it is scrolled out of view
      const onScreen = cy > -radius * 3 && cy < h + radius * 3;
      this.objects.forEach((obj) => { obj.visible = onScreen; });

      if (this.flareLevel > 0) {
        this.flareLevel = Math.max(0, this.flareLevel - delta / 1.3);
        this.host?.boost(0.2);
      }
      // Ease-out so the flash hits at once and settles
      const flare = this.flareLevel * this.flareLevel;

      this.center.set(cx, cy);
      // Spacetime "rings" for a moment after a flare: every star around it shifts
      this.radius = radius * (1 + 0.1 * flare);

      const u = this.uniforms;
      u.uCenter.value.set((cx / w) * 2 - 1, -((cy / h) * 2 - 1));
      u.uUnit.value.set((radius * 2) / w, (radius * 2) / h);
      u.uTime.value = this.time;
      u.uFlare.value = flare;
      u.uPx.value = renderer.getPixelRatio();
      // The disk leans a little with the pointer, which sells the depth
      u.uInc.value = 0.17 + (still ? 0 : input.py * 0.07);
      u.uRoll.value = -0.2 + (still ? 0 : input.px * 0.05);
      // Small and far away: fewer, dimmer photons so it doesn't burn out
      const near = Math.min(1, radius / 150);
      u.uSize.value = 0.9 + near * 1.5;
      u.uAlpha.value = (small ? 0.1 : 0.06) * (0.45 + 0.55 * near) * (150 / Math.max(radius, 30)) ** 0.9;
      this.shadowMaterial.uniforms.uAA.value = 1.5 / radius;
    },

    onResize() {},

    dispose(scene) {
      this.objects.forEach((obj) => {
        obj.material.dispose();
        scene.remove(obj);
      });
      this.geometry.dispose();
      this.quad.dispose();
    },
  };
}
