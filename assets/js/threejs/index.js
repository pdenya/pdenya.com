/**
 * Three.js Background - Entry Point
 * Initializes the background animation for the site
 */
import { Background } from './Background.js';
import { BasicScene } from './scenes/BasicScene.js';
import { StarsLayer } from './layers/StarsLayer.js';
import { CloudsLayer } from './layers/CloudsLayer.js';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threejs-bg');

  if (!container) {
    console.warn('Three.js background container not found');
    return;
  }

  // Create and initialize background
  const background = new Background(container);
  background.init();

  // Load the basic scene
  background.loadScene(BasicScene);

  // Add layers (stars first so they render behind clouds)
  background.addLayer(StarsLayer);
  background.addLayer(CloudsLayer);

  // Start animation
  background.start();

  // Expose to window for debugging (optional, remove in production)
  window.siteBackground = background;
});
