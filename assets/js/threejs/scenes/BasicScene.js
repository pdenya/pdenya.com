/**
 * BasicScene.js - Base scene setup
 * Sets up background color and camera position
 */
import * as THREE from 'three';

export const BasicScene = {
  config: {
    backgroundColor: 0x0a1c28
  },

  /**
   * Initialize the scene
   */
  setup(scene, camera, renderer) {
    scene.background = new THREE.Color(this.config.backgroundColor);
    camera.position.z = 6;
  },

  /**
   * Update - nothing to animate in base scene
   */
  update(scene, camera, renderer) {},

  /**
   * Handle window resize
   */
  onResize(width, height, camera, renderer) {},

  /**
   * Clean up scene resources
   */
  dispose(scene) {}
};
