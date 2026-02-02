/**
 * RocketFireLayerV2.js - Cartoony rocket exhaust effect
 * Based on EmmaPrats/Toon-Fire-Shaders technique
 * Uses noise + FBM + egg shape mask + flat color bands
 * Single quad with fragment shader - very efficient
 */
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uInnerColor;
  uniform vec3 uMiddleColor;
  uniform vec3 uOuterColor;
  uniform float uInnerThreshold;
  uniform float uOuterThreshold;
  uniform vec2 uCenter;
  uniform float uRadius;

  varying vec2 vUv;

  const int OCTAVES = 4;

  // Random function
  float rand(vec2 coords) {
    return fract(sin(dot(coords, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Perlin-style noise
  float noise(vec2 coord) {
    vec2 i = floor(coord);
    vec2 f = fract(coord);

    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    vec2 cubic = f * f * (3.0 - 2.0 * f);

    return mix(a, b, cubic.x) +
           (c - a) * cubic.y * (1.0 - cubic.x) +
           (d - b) * cubic.x * cubic.y;
  }

  // Fractal Brownian Motion
  float fbm(vec2 coord) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < OCTAVES; i++) {
      value += noise(coord) * amplitude;
      coord *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  // Overlay blend mode
  float overlay(float base, float over) {
    return base < 0.5
      ? 2.0 * over * base
      : 1.0 - 2.0 * (1.0 - base) * (1.0 - over);
  }

  // Teardrop shape for rocket exhaust
  // In flipped UV: y=0 is rocket base (wide), y=1 is flame tip (pointed down)
  float exhaustShape(vec2 coord) {
    float dx = coord.x - uCenter.x;

    // Taper: wide at top (base), narrows to a point at bottom (tip)
    // pow < 1 keeps it wider for longer before pinching
    float taper = pow(max(1.0 - coord.y, 0.0), 0.6);

    // Horizontal distance normalized by tapered width
    float halfWidth = uRadius * taper;
    float xNorm = dx / max(halfWidth, 0.001);

    // Smooth elliptical falloff: 1 at center, 0 at edges
    return max(0.0, 1.0 - xNorm * xNorm);
  }

  void main() {
    // Flip Y so flame base is at top of quad (attached to rocket)
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

    // Scale coordinates for noise sampling
    vec2 coord = uv * 8.0;
    vec2 fbmCoord = coord / 6.0;

    // Two noise layers moving downward (exhaust direction)
    float noise1 = noise(coord + vec2(uTime * 0.3, -uTime * 5.0));
    float noise2 = noise(coord + vec2(uTime * 0.5, -uTime * 7.0));
    float combinedNoise = (noise1 + noise2) / 2.0;

    // Gradient: bright at top (base), dark at bottom (tip)
    float gradient = uv.y;

    // FBM noise with downward movement
    float fbmNoise = fbm(fbmCoord + vec2(0.0, -uTime * 2.5));
    fbmNoise = overlay(fbmNoise, gradient);

    // Combine noises with gradient for intensity falloff
    float combined = combinedNoise * fbmNoise * 2.5 * gradient;

    // Apply exhaust shape mask
    float shape = exhaustShape(uv);

    // Fade out near bottom and side edges to prevent hard cutoff
    float bottomFade = smoothstep(1.0, 0.75, uv.y);
    float sideFade = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);
    float intensity = combined * shape * bottomFade * sideFade;

    // Flat color bands (the cartoony look!)
    vec4 color;
    if (intensity < uOuterThreshold) {
      discard; // Transparent
    } else if (intensity < uInnerThreshold) {
      color = vec4(uOuterColor, 1.0);
    } else {
      color = vec4(uMiddleColor, 1.0);
    }

    // Add bright core for values above a higher threshold
    if (intensity > 0.65) {
      color = vec4(uInnerColor, 1.0);
    }

    gl_FragColor = color;
  }
`;

export const RocketFireV2 = {
  group: null,
  clock: null,
  material: null,
  mesh: null,

  config: {
    // Cartoony saturated colors (flat bands)
    innerColor: new THREE.Color(0xffffff),   // White/bright core
    middleColor: new THREE.Color(0xffdd00),  // Yellow
    outerColor: new THREE.Color(0xff4400),   // Orange-red

    // Thresholds for color bands
    innerThreshold: 0.45,
    outerThreshold: 0.12,

    // Shape parameters
    center: new THREE.Vector2(0.5, 0.65),  // Center of egg shape (toward top where base is)
    radius: 0.6,

    // Flame dimensions
    flameWidth: 3.0,
    flameLength: 6.0,
  },

  init(parentGroup, rocketBottomY, rocketRadius) {
    this.clock = new THREE.Clock();
    this.group = new THREE.Group();
    // Shift fire up so visible flame starts at the thrusters (shader egg shape
    // doesn't draw at the very top of the plane, so we compensate)
    this.group.position.y = rocketBottomY + rocketRadius * 0.3;

    const cfg = this.config;

    // Scale flame to rocket size — length needs room for the fire to taper off
    const width = rocketRadius * 1.2;
    const length = rocketRadius * 2.5;

    // Simple plane geometry for the flame quad
    const geometry = new THREE.PlaneGeometry(width, length);
    // Shift so top edge aligns with group origin (rocket bottom)
    geometry.translate(0, -length / 2, 0);

    // Store for second mesh
    this.geometry = geometry;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uInnerColor: { value: cfg.innerColor },
        uMiddleColor: { value: cfg.middleColor },
        uOuterColor: { value: cfg.outerColor },
        uInnerThreshold: { value: cfg.innerThreshold },
        uOuterThreshold: { value: cfg.outerThreshold },
        uCenter: { value: cfg.center },
        uRadius: { value: cfg.radius },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);

    parentGroup.add(this.group);

    // Expose the visible flame bottom in world coords for frustum computation.
    // The shader's bottomFade (smoothstep at 0.75) means the flame is invisible
    // past ~80% of the quad length.
    this.fireVisibleBottomWorldY = this.group.position.y - length * 0.8;
  },

  update(delta) {
    if (!this.group) return;

    const time = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = time;
  },

  dispose() {
    if (this.group) {
      if (this.material) this.material.dispose();
      if (this.mesh) this.mesh.geometry.dispose();
    }
  }
};
