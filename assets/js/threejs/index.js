/**
 * Three.js Background - Entry Point
 * Initializes background and foreground animation layers for the site
 */
import { Background } from './Background.js';
import { BasicScene } from './scenes/BasicScene.js';
import { StarsLayer } from './layers/StarsLayer.js';
import { createCloudsLayer } from './layers/CloudsLayer.js';
import { LaserLayer } from './layers/LaserLayer.js';

// Transparent scene for foreground (no background color)
const TransparentScene = {
  setup(scene, camera, renderer) {
    scene.background = null;
    camera.position.z = 6;
  },
  update() {},
  onResize() {},
  dispose() {}
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a small screen (mobile)
  const isSmallScreen = window.innerWidth < 768;

  // Cloud settings - more restricted on mobile to take up less screen
  const bgCloudSettings = isSmallScreen
    ? { maxY: -5.0, seed: Math.random() * 100000, lightColor: 0xe9dcf4, scale: 0.9, driftSpeed: 0.025 }
    : { maxY: -2.0, seed: Math.random() * 100000, lightColor: 0xe9dcf4, scale: 0.9, driftSpeed: 0.025 };

  const fgCloudSettings = isSmallScreen
    ? { maxY: -5.5, seed: Math.random() * 100000, scale: 0.9, lightColor: 0xf0e8f7 }
    : { maxY: -4.0, seed: Math.random() * 100000, scale: 0.9, lightColor: 0xf0e8f7 };

  // Background layer (behind content)
  const bgContainer = document.getElementById('threejs-bg');
  if (bgContainer) {
    const background = new Background(bgContainer);
    background.init();
    background.loadScene(BasicScene);
    background.addLayer(StarsLayer);
    background.addLayer(createCloudsLayer(bgCloudSettings));
    background.addLayer(LaserLayer);
    background.start();
    window.siteBackground = background;
  }

  // Foreground layer (in front of content)
  const fgContainer = document.getElementById('threejs-fg');
  if (fgContainer) {
    const foreground = new Background(fgContainer);
    foreground.init();
    foreground.loadScene(TransparentScene);
    foreground.addLayer(createCloudsLayer(fgCloudSettings));
    foreground.start();
    window.siteForeground = foreground;
  }
});
