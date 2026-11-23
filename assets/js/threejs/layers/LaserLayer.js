/**
 * LaserLayer.js - Interactive laser beams on click
 * Fires lasers into space away from the viewer. Beams alternate between two
 * cannons below the screen, and can hit asteroids or the planet.
 */
import * as THREE from 'three';

const INTERACTIVE = 'a, button, input, textarea, select, summary, label, [onclick], [role="button"]';

export function createLaserLayer(options = {}) {
  const { planet = null, asteroids = null, hole = null } = options;

  return {
    lasers: [],
    side: 1,

    config: {
      color: 0x00ffff,
      coreColor: 0xffffff,
      length: 1.5,
      radius: 0.04,
      coreRadius: 0.015,
      haloRadius: 0.12,
      speed: 60,           // Units per second
      fadeDistance: 80,    // Distance at which a free shot fully fades
    },

    setup(scene, camera, renderer) {
      this.scene = scene;
      this.camera = camera;
      this.raycaster = new THREE.Raycaster();
      this._v = new THREE.Vector3();
      this._v2 = new THREE.Vector2();
      this._up = new THREE.Vector3(0, 1, 0);

      const { length, radius, coreRadius, haloRadius } = this.config;
      this.geometries = [
        new THREE.CylinderGeometry(haloRadius, haloRadius * 0.4, length * 1.15, 8, 1),
        new THREE.CylinderGeometry(radius, radius * 0.5, length, 8, 1),
        new THREE.CylinderGeometry(coreRadius, coreRadius * 0.3, length, 8, 1),
      ];

      // Bind click handler to document (canvas is behind page content)
      this._boundClick = this._onClick.bind(this);
      document.addEventListener('click', this._boundClick);
    },

    _onClick(event) {
      // Ignore clicks on interactive elements and text selections
      if (event.target.closest?.(INTERACTIVE)) return;
      if (window.getSelection && String(window.getSelection()).length > 0) return;

      const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
      const ray = this.raycaster.ray;

      // Alternate cannons, just below the bottom corners of the view
      this.side *= -1;
      const start = new THREE.Vector3(this.side * 1.5, -4, 2);

      const asteroid = asteroids?.findTarget(event.clientX, event.clientY, touch ? 30 : 16);
      if (asteroid) {
        // Lead the target by the beam's travel time
        const travel = asteroid.mesh.position.distanceTo(start) / this.config.speed;
        const aim = asteroid.mesh.position.clone().addScaledVector(asteroid.velocity, travel);
        this._fire(start, aim, aim.distanceTo(start), () => asteroids.explode(asteroid));
        return;
      }

      if (planet?.hitTest(event.clientX, event.clientY, touch ? 12 : 0)) {
        const aim = ray.origin.clone().addScaledVector(ray.direction, 34);
        this._fire(start, aim, aim.distanceTo(start), () => planet.regenerate());
        return;
      }

      // Free shot: off toward the stars
      this._fire(start, ray.origin.clone().addScaledVector(ray.direction, 100), Infinity, null);
    },

    _fire(start, target, hitDistance, onHit) {
      const { color, coreColor, length } = this.config;
      const direction = target.clone().sub(start).normalize();

      const material = (hex, opacity) => new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const materials = [material(color, 0.22), material(color, 1), material(coreColor, 1)];
      const group = new THREE.Group();
      this.geometries.forEach((geometry, i) => group.add(new THREE.Mesh(geometry, materials[i])));

      // Cylinders run along Y; turn the beam to face its direction
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      group.position.copy(start).addScaledVector(direction, length / 2);
      this.scene.add(group);

      this.lasers.push({ group, materials, direction, distance: 0, hitDistance, onHit });
      this.host?.boost(0.5);
    },

    update(scene, camera, renderer, delta) {
      if (!this.lasers.length) return;
      this.host?.boost(0.2);
      const { speed, fadeDistance } = this.config;

      for (let i = this.lasers.length - 1; i >= 0; i--) {
        const laser = this.lasers[i];
        const move = speed * delta;
        laser.group.position.addScaledVector(laser.direction, move);
        laser.distance += move;

        if (hole && this._gravity(laser, delta)) {
          hole.flare();
          this._remove(i);
          continue;
        }

        if (laser.distance >= laser.hitDistance) {
          laser.onHit?.();
          this._remove(i);
          continue;
        }

        const opacity = Math.max(0, 1 - laser.distance / fadeDistance);
        laser.materials[0].opacity = opacity * 0.22;
        laser.materials[1].opacity = opacity;
        laser.materials[2].opacity = opacity;
        if (opacity <= 0) this._remove(i);
      }
    },

    /**
     * Bend a beam toward the black hole. Returns true once it has fallen in.
     */
    _gravity(laser, delta) {
      if (hole.radius < 24 || laser.onHit) return false;
      const pos = laser.group.position;
      const ndc = this._v.copy(pos).project(this.camera);
      const sx = (ndc.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-ndc.y * 0.5 + 0.5) * window.innerHeight;
      const dist = Math.hypot(hole.center.x - sx, hole.center.y - sy);

      // Inside the shadow, far enough out to have really reached it
      if (dist < hole.radius * 0.8 && laser.distance > 6) return true;
      if (dist > hole.radius * 9) return false;

      // Pull toward the point on the hole's sight line at the beam's own depth
      const hx = (hole.center.x / window.innerWidth) * 2 - 1;
      const hy = -(hole.center.y / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this._v2.set(hx, hy), this.camera);
      const range = pos.distanceTo(this.camera.position);
      const pull = this._v.copy(this.raycaster.ray.direction).multiplyScalar(range)
        .add(this.raycaster.ray.origin).sub(pos).normalize();
      const strength = Math.min(9, 2.6 * Math.pow(hole.radius / Math.max(dist, 1), 1.6)) * (laser.distance / 20 + 0.4);
      laser.direction.addScaledVector(pull, strength * delta).normalize();
      laser.group.quaternion.setFromUnitVectors(this._up, laser.direction);
      return false;
    },

    _remove(index) {
      const laser = this.lasers[index];
      laser.materials.forEach((m) => m.dispose());
      this.scene.remove(laser.group);
      this.lasers.splice(index, 1);
    },

    onResize() {},

    dispose() {
      if (this._boundClick) document.removeEventListener('click', this._boundClick);
      for (let i = this.lasers.length - 1; i >= 0; i--) this._remove(i);
      this.geometries?.forEach((g) => g.dispose());
    },
  };
}
