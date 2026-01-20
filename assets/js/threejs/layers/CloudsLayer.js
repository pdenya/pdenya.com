/**
 * CloudsLayer.js - Dragon Ball Z style clouds
 * Smooth, puffy clouds with cel-shaded tonal bands
 * Uses separate spheres (not merged) for smooth individual shading
 */
import * as THREE from 'three';

/**
 * Simple seeded random number generator
 */
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Factory function to create a clouds layer instance
 * @param {Object} options - Configuration options
 * @param {number} options.maxY - Maximum Y position for clouds (default: -4.7)
 * @param {number} options.seed - Random seed for cloud positioning (default: 1)
 * @param {number} options.lightIntensity - Directional light intensity (default: 3)
 * @param {number} options.lightColor - Directional light color (default: 0xffffff)
 * @param {number} options.scale - Cloud scale multiplier (default: 1)
 * @param {number} options.driftSpeed - Leftward drift speed (default: 0.035)
 */
export function createCloudsLayer(options = {}) {
  const maxY = options.maxY ?? -4.7;
  const lightIntensity = options.lightIntensity ?? 3;
  const lightColor = options.lightColor ?? 0xffffff;
  const scale = options.scale ?? 1;
  const driftSpeed = options.driftSpeed ?? 0.035;
  let seed = options.seed ?? 1;

  // Seeded random function for this instance
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return {
    clouds: [],
    clock: null,
    group: null,
    lights: [],
    material: null,
    gradientMap: null,
    random: random,
    lightIntensity: lightIntensity,
    lightColor: lightColor,
    scaleMult: scale,
    driftSpeed: driftSpeed,

    config: {
      cloudCount: 28,

      // Position - lower and further back
      baseY: -5.5,
      maxY: maxY,
      yVariance: 0.8,
      xSpread: 40,
      zMin: -2,
      zMax: 4,

      // Smooth spheres
      sphereSegments: 32,

      // Animation
      driftSpeed: 0.01,
      verticalBob: 0.04,
      rotationSpeed: 0.003,
      leftDriftSpeed: 0.035,
      wrapBuffer: 5,
    },

    /**
     * Initialize the clouds layer
     */
    setup(scene, camera, renderer) {
      this.clock = new THREE.Clock();
      this.group = new THREE.Group();
      this.clouds = [];

      // Setup cel-shading lights
      this._setupLights(scene);

      // Create shared toon material
      this._createMaterial();

      // Create cloud clusters - main layer
      for (let i = 0; i < this.config.cloudCount; i++) {
        const cloud = this._createCloudCluster(i, 0);
        this.clouds.push(cloud);
        this.group.add(cloud.group);
      }

      // Second layer - fills gaps between main layer
      for (let i = 0; i < this.config.cloudCount; i++) {
        const cloud = this._createCloudCluster(i, 1);
        this.clouds.push(cloud);
        this.group.add(cloud.group);
      }

      scene.add(this.group);
    },

  /**
   * Setup lighting for cel-shaded look
   */
  _setupLights(scene) {
    // Key light from above-right - classic cloud lighting
    this.keyLight = new THREE.DirectionalLight(this.lightColor, this.lightIntensity);
    this.keyLight.position.set(0, 14, 80);
    scene.add(this.keyLight);
    this.lights.push(this.keyLight);

    // No ambient - maximum contrast for cel-shading
    const ambientLight = new THREE.AmbientLight(0x222233, 0.05);
    scene.add(ambientLight);
    this.lights.push(ambientLight);
  },

  /**
   * Create shared cel-shaded toon material
   */
  _createMaterial() {
    // 3-tone gradient for anime cel-shading
    const canvas = document.createElement('canvas');
    canvas.width = 3;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    // DBZ cloud tones - strong contrast
    ctx.fillStyle = '#2a4a6a'; // Shadow (dark blue)
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#88aac8'; // Midtone
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#ffffff'; // Highlight
    ctx.fillRect(2, 0, 1, 1);

    this.gradientMap = new THREE.CanvasTexture(canvas);
    this.gradientMap.magFilter = THREE.NearestFilter;
    this.gradientMap.minFilter = THREE.NearestFilter;

    this.material = new THREE.MeshToonMaterial({
      color: 0xffffff,
      gradientMap: this.gradientMap,
    });
  },

  /**
   * Define puffy cloud sphere arrangement - tighter, more cohesive
   */
  _getCloudTemplate() {
    return [
      // Core - tightly packed
      { x: 0, y: 0, z: 0, r: 1.1 },
      { x: -0.5, y: 0.1, z: 0, r: 0.95 },
      { x: 0.55, y: 0.05, z: 0, r: 1.0 },

      // Upper bulges
      { x: -0.2, y: 0.6, z: 0.1, r: 0.8 },
      { x: 0.25, y: 0.65, z: 0.05, r: 0.75 },
      { x: 0, y: 0.5, z: -0.05, r: 0.7 },

      // Side bulges
      { x: -0.95, y: 0.2, z: 0, r: 0.75 },
      { x: 1.0, y: 0.15, z: 0, r: 0.78 },

      // Top puffs
      { x: 0, y: 0.95, z: 0.05, r: 0.5 },
      { x: -0.35, y: 0.85, z: 0.08, r: 0.45 },
      { x: 0.3, y: 0.88, z: 0.05, r: 0.48 },
    ];
  },

  /**
   * Create a single cloud cluster
   */
  _createCloudCluster(index, layer = 0) {
    const { cloudCount, xSpread, baseY, maxY, yVariance, zMin, zMax, sphereSegments } = this.config;

    const cloudGroup = new THREE.Group();

    // Position cloud - more uniform distribution
    const spreadFactor = xSpread / cloudCount;
    const layerOffset = layer === 1 ? spreadFactor * 0.5 : 0;
    const baseX = (index - cloudCount / 2) * spreadFactor + spreadFactor / 2 + layerOffset;
    const x = baseX + (this.random() - 0.5) * spreadFactor * 0.4;

    // Second layer fills gaps - closer in z for more overlap
    const layerYOffset = layer === 1 ? -0.3 : 0;
    const layerZOffset = layer === 1 ? 1 : 0;
    const rawY = baseY + layerYOffset + (this.random() - 0.5) * yVariance;
    const y = Math.min(rawY, maxY);
    const z = zMin + layerZOffset + this.random() * (zMax - zMin);

    // Scale based on depth
    const depthFactor = (z - zMin) / (zMax - zMin);
    const scale = (1.4 + depthFactor * 0.4) * this.scaleMult;

    // Build spheres from template
    const template = this._getCloudTemplate();
    const geometry = new THREE.SphereGeometry(1, sphereSegments, sphereSegments);

    template.forEach((sphere) => {
      // Add slight randomness
      const sx = sphere.x + (this.random() - 0.5) * 0.15;
      const sy = sphere.y + (this.random() - 0.5) * 0.1;
      const sz = sphere.z + (this.random() - 0.5) * 0.1;
      const sr = sphere.r * (0.9 + this.random() * 0.2) * scale;

      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(sx * scale, sy * scale, sz * scale);
      mesh.scale.setScalar(sr);
      cloudGroup.add(mesh);
    });

    cloudGroup.position.set(x, y, z);
    // No random rotation - keeps lighting consistent across all clouds

    return {
      group: cloudGroup,
      initialX: x,
      initialY: y,
      speed: 0.5 + this.random() * 0.5,
      phase: this.random() * Math.PI * 2,
    };
  },

  /**
   * Update clouds each frame
   */
  update(scene, camera, renderer, delta) {
    if (!this.clouds.length) return;

    const { xSpread, wrapBuffer } = this.config;
    const leftBound = -xSpread / 2 - wrapBuffer;
    const rightBound = xSpread / 2 + wrapBuffer;

    this.clouds.forEach((cloud) => {
      // Continuous leftward drift
      cloud.initialX -= this.driftSpeed * delta * cloud.speed;

      // Wrap around when past left boundary
      if (cloud.initialX < leftBound) {
        cloud.initialX = rightBound;
      }

      cloud.group.position.x = cloud.initialX;
    });
  },

  /**
   * Handle resize (no-op, required by layer interface)
   */
  onResize() {},

  /**
   * Clean up resources
   */
  dispose(scene) {
    this.lights.forEach(light => scene.remove(light));
    this.lights = [];

    if (this.gradientMap) {
      this.gradientMap.dispose();
      this.gradientMap = null;
    }

    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    if (this.group) {
      this.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
      });
      scene.remove(this.group);
    }

    this.clouds = [];
    this.group = null;
    this.clock = null;
  }
  };
}
