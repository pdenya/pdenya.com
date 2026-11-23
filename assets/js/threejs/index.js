/**
 * Three.js Background - Entry Point
 * Initializes background and foreground animation layers for the site
 *
 * Tuning knobs in the URL (handy for trying things out):
 *   ?seed=123                 fix the sky, planet and asteroid layout
 *   ?planet=ocean|giant|moon|desert
 */
import { Background } from './Background.js';
import { BasicScene } from './scenes/BasicScene.js';
import { createSkyLayer } from './layers/SkyLayer.js';
import { createPlanetLayer } from './layers/PlanetLayer.js';
import { createBlackHoleLayer } from './layers/BlackHoleLayer.js';
import { createAsteroidLayer } from './layers/AsteroidLayer.js';
import { createCloudsLayer } from './layers/CloudsLayer.js';
import { createLaserLayer } from './layers/LaserLayer.js';
import { input, startInput, tickInput, inputSettling, onActivity } from './input.js';

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

// Eases pointer and scroll once per frame, and keeps the loop quick while they settle
const InputLayer = {
  update(scene, camera, renderer, delta) {
    tickInput(delta);
    if (inputSettling()) this.host.boost(0.15);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  startInput();

  const params = new URLSearchParams(window.location.search);
  const seed = parseInt(params.get('seed'), 10) || Math.floor(Math.random() * 1e9);
  const isStatic = () => input.reduced;

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
    const background = new Background(bgContainer, {
      isStatic,
      maxPixelRatio: isSmallScreen ? 1.5 : 2,
    });
    const hole = createBlackHoleLayer({ seed: seed + 3 });
    const planet = createPlanetLayer({ seed: seed + 1, kind: params.get('planet') });
    const asteroids = createAsteroidLayer({ seed: seed + 2, max: isSmallScreen ? 2 : 3 });

    background.init();
    background.loadScene(BasicScene);
    background.addLayer(InputLayer);
    background.addLayer(hole);
    background.addLayer(createSkyLayer({ seed, hole }));
    background.addLayer(planet);
    background.addLayer(createCloudsLayer(bgCloudSettings));
    background.addLayer(asteroids);
    background.addLayer(createLaserLayer({ planet, asteroids, hole }));
    background.start();
    onActivity(() => background.boost(0.25));
    window.siteBackground = background;
  }

  // Foreground layer (in front of content)
  const fgContainer = document.getElementById('threejs-fg');
  if (fgContainer) {
    const foreground = new Background(fgContainer, { isStatic, maxPixelRatio: 1.5 });
    foreground.init();
    foreground.loadScene(TransparentScene);
    foreground.addLayer(createCloudsLayer(fgCloudSettings));
    foreground.start();
    window.siteForeground = foreground;
  }
});
