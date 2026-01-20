/**
 * LaserLayer.js - Interactive laser beams on click
 * Fires lasers into space away from the viewer
 */
import * as THREE from 'three';

export const LaserLayer = {
  lasers: [],
  renderer: null,
  camera: null,
  scene: null,
  raycaster: null,

  config: {
    // Laser appearance
    color: 0x00ffff,
    coreColor: 0xffffff,
    length: 1.5,
    radius: 0.04,
    coreRadius: 0.015,

    // Animation
    speed: 60,           // Units per second
    fadeDistance: 80,    // Distance at which laser fully fades

    // Glow effect
    glowIntensity: 1.0,
  },

  /**
   * Initialize the laser layer
   */
  setup(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.lasers = [];
    this.raycaster = new THREE.Raycaster();

    // Bind click handler to document (canvas is behind page content)
    this._boundClick = this._onClick.bind(this);
    document.addEventListener('click', this._boundClick);
  },

  /**
   * Handle click events
   */
  _onClick(event) {
    // Ignore clicks on interactive elements
    const target = event.target;
    const interactiveSelectors = 'a, button, input, textarea, select, [onclick], [role="button"]';
    if (target.closest(interactiveSelectors)) {
      return;
    }

    // Get normalized device coordinates for click position
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Calculate target point in space where user clicked
    const mouse = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(mouse, this.camera);

    // Get a point far in the distance where the user clicked
    const targetPoint = this.raycaster.ray.origin.clone()
      .add(this.raycaster.ray.direction.clone().multiplyScalar(100));

    // Start position: bottom of screen, slightly in front of camera
    const startPos = new THREE.Vector3(0, -4, 2);

    // Direction from bottom toward the clicked point in space
    const direction = targetPoint.clone().sub(startPos).normalize();

    this._fireLaser(startPos, direction);
  },

  /**
   * Create and fire a laser beam
   */
  _fireLaser(position, direction) {
    const { color, coreColor, length, radius, coreRadius, glowIntensity } = this.config;

    // Create outer glow cylinder
    const glowGeometry = new THREE.CylinderGeometry(radius, radius * 0.5, length, 8, 1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: glowIntensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

    // Create bright core
    const coreGeometry = new THREE.CylinderGeometry(coreRadius, coreRadius * 0.3, length, 8, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);

    // Group them together
    const laserGroup = new THREE.Group();
    laserGroup.add(glowMesh);
    laserGroup.add(coreMesh);

    // Position at start
    laserGroup.position.copy(position);

    // Rotate to point in direction
    // Cylinder is created along Y axis, so we need to rotate it
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    laserGroup.quaternion.copy(quaternion);

    // Offset so the laser starts from the click point (cylinder center is at origin)
    laserGroup.position.add(direction.clone().multiplyScalar(length / 2));

    this.scene.add(laserGroup);

    // Track this laser for animation
    this.lasers.push({
      group: laserGroup,
      glowMesh,
      coreMesh,
      glowMaterial,
      coreMaterial,
      direction: direction.clone(),
      distance: 0,
      startPosition: position.clone(),
    });
  },

  /**
   * Update lasers each frame
   */
  update(scene, camera, renderer, delta) {
    const { speed, fadeDistance } = this.config;

    // Update each laser
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];

      // Move laser forward
      const moveAmount = speed * delta;
      laser.group.position.add(laser.direction.clone().multiplyScalar(moveAmount));
      laser.distance += moveAmount;

      // Fade out based on distance
      const fadeProgress = laser.distance / fadeDistance;
      const opacity = Math.max(0, 1 - fadeProgress);

      laser.glowMaterial.opacity = opacity * this.config.glowIntensity;
      laser.coreMaterial.opacity = opacity;

      // Remove if fully faded
      if (opacity <= 0) {
        this._removeLaser(laser, i);
      }
    }
  },

  /**
   * Remove a laser from the scene
   */
  _removeLaser(laser, index) {
    laser.glowMesh.geometry.dispose();
    laser.coreMesh.geometry.dispose();
    laser.glowMaterial.dispose();
    laser.coreMaterial.dispose();
    this.scene.remove(laser.group);
    this.lasers.splice(index, 1);
  },

  /**
   * Handle resize (no-op)
   */
  onResize() {},

  /**
   * Clean up resources
   */
  dispose(scene) {
    // Remove click listener
    if (this._boundClick) {
      document.removeEventListener('click', this._boundClick);
    }

    // Remove all lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      this._removeLaser(this.lasers[i], i);
    }

    this.lasers = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
};
