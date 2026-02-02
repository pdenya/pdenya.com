/**
 * Saturn V 3D Viewer
 * Interactive Three.js viewer for the Saturn V rocket model
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RocketFireV2 } from './threejs/layers/RocketFireLayerV2.js';

// Configuration constants
const CONFIG = {
  // Sizing — these drive container height and camera frustum automatically.
  // PIXEL_SCALE controls rocket visual size (pixels per model-height unit).
  // PADDING controls empty space above/below content as a fraction of model height.
  PIXEL_SCALE: 5600,
  PIXEL_SCALE_MOBILE: 2400,
  MOBILE_BREAKPOINT: 767,
  PADDING_TOP: 0.15,
  PADDING_BOTTOM: 0.15,

  // Interaction
  BASE_ROTATION_SPEED: 0.001,
  DRAG_SENSITIVITY: 0.01,
  SPIN_SENSITIVITY: 0.002,
  SPIN_DECAY: 0.98,
};

/**
 * Initialize and manage the Saturn V 3D viewer
 */
export class SaturnVViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pivot = null;
    this.loader = null;

    this.userSpinVelocity = 0;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.animClock = new THREE.Clock();
    this.isVisible = true;

    // Set after model loads — used by onResize
    this.frustumTop = null;
    this.frustumBottom = null;
    this.modelHeight = null;

    // Pause rendering when off-screen
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) this.animClock.getDelta(); // reset delta to avoid jump
      },
      { threshold: 0 }
    );
    this.observer.observe(this.container);

    this.init();
  }

  /**
   * Initialize the Three.js scene, camera, and renderer
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();

    // Orthographic camera — placeholder frustum, overridden in computeSizing
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x333344, 0.4);
    this.scene.add(ambientLight);

    // Create pivot group for rotation
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    // Load the model
    this.loadModel();

    // Setup interaction handlers
    this.setupEventHandlers();

    // Start animation loop
    this.animate();
  }

  /**
   * Load and configure the Saturn V GLTF model
   */
  loadModel() {
    this.loader = new GLTFLoader();
    this.loader.load('/models/saturn-v.glb', (gltf) => {
      const model = gltf.scene;

      // Calculate model bounds and center
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model within the pivot
      model.position.sub(center);
      this.pivot.add(model);

      // Make materials more matte
      this.configureMaterials(model);

      // Init fire first — computeSizing needs the fire's visible extent
      const rocketBottomY = -size.y / 2 + this.pivot.position.y;
      const rocketRadius = Math.max(size.x, size.z) / 2;
      RocketFireV2.init(this.scene, rocketBottomY, rocketRadius);

      // Compute frustum from model + fire bounds, set container height
      this.computeSizing(size);

      // Position camera
      this.camera.position.set(0, 0, 500);
      this.camera.lookAt(0, 0, 0);
    });
  }

  /**
   * Configure materials to be more matte
   */
  configureMaterials(model) {
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material;
        if (mat.metalness !== undefined) {
          mat.metalness = Math.min(mat.metalness, 0.1);
        }
        if (mat.roughness !== undefined) {
          mat.roughness = Math.max(mat.roughness, 0.7);
        }
      }
    });
  }

  /**
   * Compute camera frustum from model + fire geometry and set container height.
   * This is the single source of truth for sizing — everything derives from
   * the actual scene content plus PIXEL_SCALE and PADDING config values.
   */
  computeSizing(size) {
    const H = size.y;
    this.modelHeight = H;

    // Content bounds in world coordinates (model centered at origin)
    const contentTop = H / 2;
    const contentBottom = RocketFireV2.fireVisibleBottomWorldY;

    // Add padding (fraction of model height)
    this.frustumTop = contentTop + H * CONFIG.PADDING_TOP;
    this.frustumBottom = contentBottom - H * CONFIG.PADDING_BOTTOM;

    // Derive container height from frustum and pixel scale
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const pixelScale = isMobile ? CONFIG.PIXEL_SCALE_MOBILE : CONFIG.PIXEL_SCALE;
    const frustumHeight = this.frustumTop - this.frustumBottom;
    const pixelsPerUnit = pixelScale / H;
    const containerHeight = Math.round(frustumHeight * pixelsPerUnit);

    // Set container height — CSS provides fallback before model loads
    this.container.parentElement.style.height = `${containerHeight}px`;

    // Set camera frustum
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const halfWidth = (frustumHeight * aspect) / 2;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = this.frustumTop;
    this.camera.bottom = this.frustumBottom;
    this.camera.updateProjectionMatrix();

    // Update renderer to new container size
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // Position placards — data-scene-y is a fraction of model height from center
    this.positionPlacards(pixelsPerUnit);
  }

  /**
   * Position placard elements based on their data-scene-y attribute.
   * Converts scene Y coordinates to pixel offsets from container top.
   */
  positionPlacards(pixelsPerUnit) {
    const placards = this.container.parentElement.querySelectorAll('[data-scene-y]');
    placards.forEach(placard => {
      const sceneY = parseFloat(placard.dataset.sceneY) * this.modelHeight;
      placard.style.top = `${Math.round((this.frustumTop - sceneY) * pixelsPerUnit)}px`;
    });
  }

  /**
   * Setup mouse and touch event handlers
   */
  setupEventHandlers() {
    // Mouse events
    this.container.addEventListener('mousedown', (e) => this.onDragStart(e.clientX));
    this.container.addEventListener('mousemove', (e) => this.onDragMove(e.clientX));
    this.container.addEventListener('mouseup', () => this.onDragEnd());
    this.container.addEventListener('mouseleave', () => this.onDragEnd());

    // Touch events
    this.container.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0].clientX));
    this.container.addEventListener('touchmove', (e) => this.onDragMove(e.touches[0].clientX));
    this.container.addEventListener('touchend', () => this.onDragEnd());

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  /**
   * Handle drag start
   */
  onDragStart(clientX) {
    this.isDragging = true;
    this.previousMouseX = clientX;
    this.userSpinVelocity = 0;
  }

  /**
   * Handle drag move
   */
  onDragMove(clientX) {
    if (!this.isDragging) return;

    const deltaX = clientX - this.previousMouseX;
    this.pivot.rotation.y += deltaX * CONFIG.DRAG_SENSITIVITY;
    this.userSpinVelocity = deltaX * CONFIG.SPIN_SENSITIVITY;
    this.previousMouseX = clientX;
  }

  /**
   * Handle drag end
   */
  onDragEnd() {
    this.isDragging = false;
  }

  /**
   * Handle window resize
   */
  onResize() {
    if (!this.modelHeight) return;

    // Recompute container height (viewport may have crossed mobile breakpoint)
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const pixelScale = isMobile ? CONFIG.PIXEL_SCALE_MOBILE : CONFIG.PIXEL_SCALE;
    const frustumHeight = this.frustumTop - this.frustumBottom;
    const pixelsPerUnit = pixelScale / this.modelHeight;
    this.container.parentElement.style.height = `${Math.round(frustumHeight * pixelsPerUnit)}px`;

    // Update horizontal frustum for new aspect ratio (vertical stays fixed)
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const halfWidth = (frustumHeight * aspect) / 2;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // Reposition placards for new pixel scale
    this.positionPlacards(pixelsPerUnit);
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    const delta = this.animClock.getDelta();

    // Apply rotation when not dragging
    if (!this.isDragging) {
      if (Math.abs(this.userSpinVelocity) > CONFIG.BASE_ROTATION_SPEED) {
        // Apply user spin with decay
        this.pivot.rotation.y += this.userSpinVelocity;
        this.userSpinVelocity *= CONFIG.SPIN_DECAY;
      } else {
        // Fall back to slow base rotation
        this.pivot.rotation.y += CONFIG.BASE_ROTATION_SPEED;
        this.userSpinVelocity = 0;
      }
    }

    // Update fire effect
    RocketFireV2.update(delta);

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    RocketFireV2.dispose();
  }
}

