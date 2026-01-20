/**
 * StarsLayer.js - Self-illuminated stylized stars
 * Uses InstancedMesh with MeshBasicMaterial for consistent glow
 * Uses Poisson disk sampling for even distribution
 */
import * as THREE from 'three';
import FastPoissonDiskSampling from 'fast-2d-poisson-disk-sampling';

export const StarsLayer = {
  starMesh: null,
  glowMesh: null,
  clock: null,
  material: null,
  glowMaterial: null,
  dummy: null,
  starData: [],

  config: {
    // Position bounds - full sky behind clouds (clouds are z: -2 to 4)
    xSpread: 80,
    yMin: -8,
    yMax: 14,
    zMin: -20,
    zMax: -3,

    // Poisson disk sampling - minimum distance between stars
    minStarDistance: 0.6,

    // Star sizes
    minSize: 0.008,
    maxSize: 0.015,

    // Brightness variation (can go above 1.0 for extra bright stars)
    minBrightness: 0.5,
    maxBrightness: 1.5,

    // Corona/glow settings
    coronaChance: 0.15,      // Percentage of stars that get a corona
    coronaScale: 2.0,        // How much bigger the corona is than the star
    coronaOpacity: 0.1,      // Opacity of the corona

    // Distortion compensation
    edgeStretchX: 2,       // Make side stars taller (counteract horizontal stretch)
    edgeStretchY: 2,       // Make top/bottom stars wider (counteract vertical stretch)

    // Animation (set twinkleChance to 0 to disable)
    twinkleChance: 0,
    twinkleDuration: 0.4,
    twinkleAmount: 0.2,
  },

  /**
   * Initialize the stars layer
   */
  setup(scene, camera, renderer) {
    this.clock = new THREE.Clock();
    this.starData = [];
    this.dummy = new THREE.Object3D();

    // Create material
    this._createMaterial();

    // Create star field
    this._createStarField(scene);
  },

  /**
   * Create self-illuminated material for stars
   */
  _createMaterial() {
    // MeshBasicMaterial with additive blending for glow effect
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Softer material for corona glow
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: this.config.coronaOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  },

  /**
   * Create instanced star field
   */
  _createStarField(scene) {
    const { xSpread, yMin, yMax, zMin, zMax, minSize, maxSize, minBrightness, maxBrightness, coronaChance, coronaScale, minStarDistance } = this.config;
    const color = new THREE.Color();

    // Generate star positions using Poisson disk sampling
    const yRange = yMax - yMin;
    const pds = new FastPoissonDiskSampling({
      shape: [xSpread, yRange],
      radius: minStarDistance,
      tries: 30
    });
    const points = pds.fill();

    // High detail sphere for perfectly round stars
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    this.starMesh = new THREE.InstancedMesh(geometry, this.material, points.length);

    // Track which stars get coronas
    const coronaStars = [];

    // Position each star using Poisson disk points
    for (let i = 0; i < points.length; i++) {
      // Convert from Poisson space to world space
      const x = points[i][0] - xSpread / 2;
      const y = points[i][1] + yMin;
      const z = zMin + Math.random() * (zMax - zMin);

      // Calculate edge factors (0 at center, 1 at edges)
      const edgeFactorX = Math.abs(x) / (xSpread / 2);
      const yCenter = (yMin + yMax) / 2;
      const yHalfRange = (yMax - yMin) / 2;
      const edgeFactorY = Math.abs(y - yCenter) / yHalfRange;

      // Random size - smaller stars at edges, full range in center
      const edgeFactor = Math.max(edgeFactorX, edgeFactorY);
      const sizeRange = maxSize - minSize;
      const maxSizeAtPosition = minSize + sizeRange * (1 - edgeFactor * 0.8);
      const size = minSize + Math.random() * (maxSizeAtPosition - minSize);

      // Distortion compensation: sides get taller, top/bottom get wider
      const yStretch = 1 + edgeFactorX * this.config.edgeStretchX;
      const xStretch = 1 + edgeFactorY * this.config.edgeStretchY;

      // Random brightness
      const brightness = minBrightness + Math.random() * (maxBrightness - minBrightness);

      // Store data for animation
      this.starData.push({
        x, y, z,
        baseSize: size,
        xStretch,
        yStretch,
        twinkleStart: -1,
      });

      // Set initial transform with distortion compensation
      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.scale.set(size * xStretch, size * yStretch, size);
      this.dummy.updateMatrix();
      this.starMesh.setMatrixAt(i, this.dummy.matrix);

      color.setRGB(brightness, brightness, brightness);
      this.starMesh.setColorAt(i, color);

      // Chance to add corona (only big AND bright stars)
      const isBig = size > (minSize + sizeRange * 0.7);  // Top 30% of sizes
      const isBright = brightness > 1.2;
      if (Math.random() < coronaChance && isBig && isBright) {
        coronaStars.push({ x, y, z, size, xStretch, yStretch, brightness });
      }
    }

    this.starMesh.instanceMatrix.needsUpdate = true;
    this.starMesh.instanceColor.needsUpdate = true;
    scene.add(this.starMesh);

    // Create corona mesh for selected stars
    if (coronaStars.length > 0) {
      this.glowMesh = new THREE.InstancedMesh(geometry, this.glowMaterial, coronaStars.length);

      for (let i = 0; i < coronaStars.length; i++) {
        const star = coronaStars[i];
        const coronaSize = star.size * coronaScale;

        this.dummy.position.set(star.x, star.y, star.z - 0.01); // Slightly behind
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.scale.set(coronaSize * star.xStretch, coronaSize * star.yStretch, coronaSize);
        this.dummy.updateMatrix();
        this.glowMesh.setMatrixAt(i, this.dummy.matrix);

        // Tint corona based on star brightness
        color.setRGB(star.brightness * 0.5, star.brightness * 0.5, star.brightness * 0.6);
        this.glowMesh.setColorAt(i, color);
      }

      this.glowMesh.instanceMatrix.needsUpdate = true;
      this.glowMesh.instanceColor.needsUpdate = true;
      scene.add(this.glowMesh);
    }
  },

  /**
   * Update stars each frame - occasional quick twinkles
   */
  update() {
    if (!this.clock || !this.starMesh) return;

    const elapsed = this.clock.getElapsedTime();
    const { twinkleChance, twinkleDuration, twinkleAmount } = this.config;
    let anyChanged = false;

    for (let i = 0; i < this.starData.length; i++) {
      const star = this.starData[i];
      let scale = star.baseSize;
      let changed = false;

      // Check if currently twinkling
      if (star.twinkleStart >= 0) {
        const twinkleElapsed = elapsed - star.twinkleStart;

        if (twinkleElapsed < twinkleDuration) {
          // Quick flash: up then down
          const progress = twinkleElapsed / twinkleDuration;
          const flash = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
          scale = star.baseSize * (1 + flash * twinkleAmount);
          changed = true;
        } else {
          // Twinkle finished
          star.twinkleStart = -1;
          changed = true;
        }
      } else {
        // Random chance to start twinkling
        if (Math.random() < twinkleChance) {
          star.twinkleStart = elapsed;
        }
      }

      // Only update matrix if this star changed
      if (changed) {
        this.dummy.position.set(star.x, star.y, star.z);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.scale.set(scale * star.xStretch, scale * star.yStretch, scale);
        this.dummy.updateMatrix();
        this.starMesh.setMatrixAt(i, this.dummy.matrix);
        anyChanged = true;
      }
    }

    if (anyChanged) {
      this.starMesh.instanceMatrix.needsUpdate = true;
    }
  },

  /**
   * Handle resize (no-op, required by layer interface)
   */
  onResize() {},

  /**
   * Clean up resources
   */
  dispose(scene) {
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    if (this.glowMaterial) {
      this.glowMaterial.dispose();
      this.glowMaterial = null;
    }

    if (this.starMesh) {
      this.starMesh.geometry.dispose();
      scene.remove(this.starMesh);
      this.starMesh = null;
    }

    if (this.glowMesh) {
      this.glowMesh.geometry.dispose();
      scene.remove(this.glowMesh);
      this.glowMesh = null;
    }

    this.starData = [];
    this.clock = null;
  }
};
