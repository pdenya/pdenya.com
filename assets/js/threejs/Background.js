/**
 * Background.js - Three.js background manager
 * Handles canvas setup, rendering loop, and scene management
 */
import * as THREE from 'three';

export class Background {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.options = {
      antialias: true,
      alpha: true,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.animationId = null;
    this.currentScene = null;
    this.layers = [];

    this._boundResize = this._onResize.bind(this);
    this._boundAnimate = this._animate.bind(this);
  }

  /**
   * Initialize the Three.js renderer and camera
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.options.antialias,
      alpha: this.options.alpha
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add canvas to container
    this.container.appendChild(this.renderer.domElement);

    // Setup clock for delta time
    this.clock = new THREE.Clock();

    // Setup resize listener
    window.addEventListener('resize', this._boundResize);

    return this;
  }

  /**
   * Load a scene module
   * @param {Object} sceneModule - Scene module with setup() and update() methods
   */
  loadScene(sceneModule) {
    // Clean up previous scene if exists
    if (this.currentScene && this.currentScene.dispose) {
      this.currentScene.dispose(this.scene);
    }

    // Clear existing objects from scene (except camera)
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Initialize new scene
    this.currentScene = sceneModule;
    if (sceneModule.setup) {
      sceneModule.setup(this.scene, this.camera, this.renderer);
    }

    return this;
  }

  /**
   * Add a layer to the scene
   * @param {Object} layerModule - Layer module with setup() and update() methods
   */
  addLayer(layerModule) {
    if (layerModule.setup) {
      layerModule.setup(this.scene, this.camera, this.renderer);
    }
    this.layers.push(layerModule);
    return this;
  }

  /**
   * Remove a layer from the scene
   * @param {Object} layerModule - The layer to remove
   */
  removeLayer(layerModule) {
    const index = this.layers.indexOf(layerModule);
    if (index > -1) {
      if (layerModule.dispose) {
        layerModule.dispose(this.scene);
      }
      this.layers.splice(index, 1);
    }
    return this;
  }

  /**
   * Start the animation loop
   */
  start() {
    if (!this.animationId) {
      this._animate();
    }
    return this;
  }

  /**
   * Stop the animation loop
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    return this;
  }

  /**
   * Internal animation loop
   */
  _animate() {
    this.animationId = requestAnimationFrame(this._boundAnimate);

    const delta = this.clock.getDelta();

    // Update current scene if it has an update method
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(this.scene, this.camera, this.renderer, delta);
    }

    // Update all layers
    this.layers.forEach((layer) => {
      if (layer.update) {
        layer.update(this.scene, this.camera, this.renderer, delta);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // Notify current scene of resize
    if (this.currentScene && this.currentScene.onResize) {
      this.currentScene.onResize(width, height, this.camera, this.renderer);
    }

    // Notify all layers of resize
    this.layers.forEach((layer) => {
      if (layer.onResize) {
        layer.onResize(width, height, this.camera, this.renderer);
      }
    });
  }

  /**
   * Clean up and destroy the background
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._boundResize);

    // Dispose all layers
    this.layers.forEach((layer) => {
      if (layer.dispose) {
        layer.dispose(this.scene);
      }
    });
    this.layers = [];

    if (this.currentScene && this.currentScene.dispose) {
      this.currentScene.dispose(this.scene);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.currentScene = null;
  }
}
