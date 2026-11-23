/**
 * AsteroidLayer.js - Slow asteroids to shoot at
 *
 * A couple of cel-shaded rocks drift across the sky. A laser hit breaks one into
 * tumbling fragments and sparks, and a new one wanders in a little later.
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { NOISE, rng } from '../glsl.js';
import { input } from '../input.js';

const STORAGE_KEY = 'pd-asteroids';

// Value noise for shaping the rocks (runs once per rock, at load)
function hash3(x, y, z) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const s = (v) => v * v * (3 - 2 * v);
  const fx = s(x - ix), fy = s(y - iy), fz = s(z - iz);
  const mix = (a, b, k) => a + (b - a) * k;
  return mix(
    mix(mix(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), fx), mix(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), fx), fy),
    mix(mix(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), fx), mix(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), fx), fy),
    fz
  );
}

/**
 * A rock: a smooth sphere pushed around by layered noise, with a few impact
 * dents, then squashed off-round. Smooth normals so the cel shading reads as
 * rounded forms; the fine surface detail is added in the shader.
 */
function rockGeometry(random, detail = 14) {
  const geometry = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
  const pos = geometry.attributes.position;
  const ox = random() * 50, oy = random() * 50, oz = random() * 50;
  const dents = Array.from({ length: 4 }, () => ({
    dir: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
    size: 0.86 + random() * 0.09,
    depth: 0.10 + random() * 0.12,
  }));
  const stretch = new THREE.Vector3(0.85 + random() * 0.35, 0.72 + random() * 0.25, 0.85 + random() * 0.3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let r = 0.74
      + 0.40 * noise3(v.x * 1.3 + ox, v.y * 1.3 + oy, v.z * 1.3 + oz)
      + 0.16 * noise3(v.x * 3.1 + oy, v.y * 3.1 + oz, v.z * 3.1 + ox)
      + 0.06 * noise3(v.x * 7.0 + oz, v.y * 7.0 + ox, v.z * 7.0 + oy);
    for (const dent of dents) {
      const d = v.dot(dent.dir);
      if (d > dent.size) {
        const k = (d - dent.size) / (1 - dent.size);
        r -= dent.depth * k * k * (3 - 2 * k);
      }
    }
    v.multiplyScalar(r).multiply(stretch);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createAsteroidLayer(options = {}) {
  const random = rng(options.seed ?? 1);
  const max = options.max ?? 3;

  return {
    asteroids: [],
    fragments: [],
    bursts: [],
    spawnIn: 0,
    score: 0,

    setup(scene, camera, renderer) {
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      // Self-lit cel shading in three tones, like the clouds, with a cool rim
      // light. No scene lights, so the clouds' own lighting is untouched.
      this.material = new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
          varying vec3 vNormal;
          varying vec3 vObj;
          varying vec3 vView;
          void main() {
            vObj = position;
            vNormal = normalMatrix * normal;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */`
          precision highp float;
          varying vec3 vNormal;
          varying vec3 vObj;
          varying vec3 vView;
          ${NOISE}
          void main() {
            // Pitted surface: nudge the normal with fine noise
            vec3 q = vObj * 5.5;
            vec3 bump = vec3(noise3(q), noise3(q + 17.0), noise3(q + 31.0)) - 0.5;
            vec3 n = normalize(normalize(vNormal) + bump * 0.55);
            vec3 v = normalize(-vView);

            // Rock color: slate with darker mineral patches
            float patches = fbm(vObj * 1.7 + 4.0);
            vec3 base = mix(vec3(0.50, 0.47, 0.55), vec3(0.33, 0.31, 0.40), smoothstep(0.46, 0.54, patches));
            base *= 0.9 + 0.2 * noise3(vObj * 9.0);

            float l = dot(n, normalize(vec3(-0.55, 0.45, 0.70)));
            float lit = 0.26 + 0.36 * smoothstep(-0.04, 0.04, l) + 0.38 * smoothstep(0.42, 0.50, l);
            vec3 night = vec3(0.05, 0.08, 0.14);
            vec3 col = base * lit * 1.45 + night * (1.0 - lit) * 0.7;

            // Thin cool edge light, strongest on the lit side
            float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
            col += vec3(0.50, 0.66, 0.95) * rim * 0.38 * smoothstep(-0.3, 0.4, l);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      });
      this.geometries = [rockGeometry(random), rockGeometry(random), rockGeometry(random)];
      this.fragmentGeometry = rockGeometry(random, 4);
      this.ringGeometry = new THREE.RingGeometry(0.9, 1, 48);
      try {
        this.score = parseInt(window.localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
      } catch (e) {
        this.score = 0;
      }
      if (!input.reduced) {
        // One already in view so there is something to find straight away
        this._spawn(true);
        this.spawnIn = 2 + random() * 3;
      }
    },

    _bounds(z) {
      const dist = this.camera.position.z - z;
      const halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * dist;
      return { halfH, halfW: halfH * this.camera.aspect };
    },

    _spawn(inView = false) {
      const z = -14 + random() * 6;
      const { halfW, halfH } = this._bounds(z);
      const size = 0.45 + random() * 0.5;
      const dir = random() < 0.5 ? 1 : -1;
      const mesh = new THREE.Mesh(this.geometries[Math.floor(random() * this.geometries.length)], this.material);
      const x = inView
        ? dir * halfW * (0.72 + random() * 0.2)
        : -dir * (halfW + size * 2);
      const y = -halfH * 0.05 + random() * halfH * 0.8;
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(size);
      mesh.rotation.set(random() * 6, random() * 6, random() * 6);
      this.scene.add(mesh);
      this.asteroids.push({
        mesh,
        size,
        velocity: new THREE.Vector3(dir * (0.22 + random() * 0.3), (random() - 0.5) * 0.12, 0),
        spin: new THREE.Vector3((random() - 0.5) * 0.7, (random() - 0.5) * 0.7, (random() - 0.5) * 0.4),
      });
    },

    /** Project to CSS pixels: { x, y, r } */
    _screen(asteroid) {
      const p = asteroid.mesh.position.clone().project(this.camera);
      const { halfH } = this._bounds(asteroid.mesh.position.z);
      return {
        x: (p.x * 0.5 + 0.5) * window.innerWidth,
        y: (-p.y * 0.5 + 0.5) * window.innerHeight,
        r: (asteroid.size / halfH) * (window.innerHeight / 2),
      };
    },

    /** Nearest asteroid under a click, with some forgiveness */
    findTarget(clientX, clientY, slop = 16) {
      let best = null;
      let bestDist = Infinity;
      for (const asteroid of this.asteroids) {
        const s = this._screen(asteroid);
        const d = Math.hypot(clientX - s.x, clientY - s.y);
        if (d < s.r + slop && d < bestDist) {
          best = asteroid;
          bestDist = d;
        }
      }
      return best;
    },

    explode(asteroid) {
      const renderer = this.renderer;
      const index = this.asteroids.indexOf(asteroid);
      if (index === -1) return;
      this.asteroids.splice(index, 1);
      const origin = asteroid.mesh.position.clone();
      this.scene.remove(asteroid.mesh);

      // Chunks
      const count = 5 + Math.floor(random() * 3);
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(this.fragmentGeometry, this.material);
        const angle = (i / count) * Math.PI * 2 + random() * 0.8;
        const speed = 1.2 + random() * 2.2;
        mesh.position.copy(origin);
        mesh.rotation.set(random() * 6, random() * 6, random() * 6);
        const size = asteroid.size * (0.22 + random() * 0.2);
        mesh.scale.setScalar(size);
        this.scene.add(mesh);
        this.fragments.push({
          mesh,
          size,
          life: 0,
          duration: 0.8 + random() * 0.5,
          velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, (random() - 0.5) * 2)
            .add(asteroid.velocity),
          spin: new THREE.Vector3(random() * 6 - 3, random() * 6 - 3, random() * 6 - 3),
        });
      }

      // Sparks + shock ring
      const sparkCount = 36;
      const positions = new Float32Array(sparkCount * 3);
      const velocities = [];
      for (let i = 0; i < sparkCount; i++) {
        positions.set([origin.x, origin.y, origin.z], i * 3);
        const angle = random() * Math.PI * 2;
        const speed = 1.5 + random() * 5;
        velocities.push(new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, (random() - 0.5) * 2));
      }
      const sparkGeometry = new THREE.BufferGeometry();
      sparkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const sparkMaterial = new THREE.ShaderMaterial({
        uniforms: {
          opacity: { value: 1 },
          uSize: { value: 150 * renderer.getPixelRatio() },
        },
        vertexShader: /* glsl */`
          uniform float uSize;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize / -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */`
          precision highp float;
          uniform float opacity;
          void main() {
            float r = length(gl_PointCoord - 0.5) * 2.0;
            float a = smoothstep(1.0, 0.25, r) * opacity;
            gl_FragColor = vec4(vec3(0.75, 0.96, 1.0) * a, 1.0);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
      sparks.frustumCulled = false;
      this.scene.add(sparks);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x9fefff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(this.ringGeometry, ringMaterial);
      ring.position.copy(origin);
      this.scene.add(ring);

      this.bursts.push({ sparks, velocities, ring, size: asteroid.size, life: 0 });

      this.score++;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(this.score));
      } catch (e) { /* private mode */ }
      this._showScore();
      this.spawnIn = Math.max(this.spawnIn, 2.5 + random() * 3);
    },

    /** Small tally that appears after a hit and fades away again */
    _showScore() {
      if (!this.badge) {
        const badge = document.createElement('div');
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-live', 'polite');
        badge.className = 'sky-score';
        badge.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">'
          + '<path d="M12 2.5 19.5 6l2 7.5-4.5 7-8.5 1L3 15.5 4 7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
          + '<path d="M8.5 9.5 11 12m4-3.5-1 3 2.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
          + '</svg><span></span>';
        document.body.appendChild(badge);
        this.badge = badge;
        this.badgeText = badge.querySelector('span');
      }
      this.badgeText.textContent = this.score === 1 ? '1 asteroid cleared' : `${this.score} asteroids cleared`;
      this.badge.classList.add('is-visible');
      clearTimeout(this.badgeTimer);
      this.badgeTimer = setTimeout(() => this.badge.classList.remove('is-visible'), 3200);
    },

    update(scene, camera, renderer, delta) {
      const busy = this.fragments.length || this.bursts.length;
      if (busy) this.host?.boost(0.2);

      if (!input.reduced) {
        // Drift
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
          const a = this.asteroids[i];
          a.mesh.position.addScaledVector(a.velocity, delta);
          a.mesh.rotation.x += a.spin.x * delta;
          a.mesh.rotation.y += a.spin.y * delta;
          a.mesh.rotation.z += a.spin.z * delta;
          const { halfW } = this._bounds(a.mesh.position.z);
          if (Math.abs(a.mesh.position.x) > halfW + a.size * 3) {
            scene.remove(a.mesh);
            this.asteroids.splice(i, 1);
          }
        }

        // Keep the sky stocked, unhurriedly
        if (this.asteroids.length < max) {
          this.spawnIn -= delta;
          if (this.spawnIn <= 0) {
            this._spawn();
            this.spawnIn = 5 + random() * 8;
          }
        }
      }

      for (let i = this.fragments.length - 1; i >= 0; i--) {
        const f = this.fragments[i];
        f.life += delta;
        const t = f.life / f.duration;
        if (t >= 1) {
          scene.remove(f.mesh);
          this.fragments.splice(i, 1);
          continue;
        }
        f.velocity.multiplyScalar(1 - delta * 1.2);
        f.mesh.position.addScaledVector(f.velocity, delta);
        f.mesh.rotation.x += f.spin.x * delta;
        f.mesh.rotation.y += f.spin.y * delta;
        f.mesh.scale.setScalar(f.size * (1 - t * t));
      }

      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.life += delta;
        const t = b.life / 0.7;
        if (t >= 1) {
          scene.remove(b.sparks);
          scene.remove(b.ring);
          b.sparks.geometry.dispose();
          b.sparks.material.dispose();
          b.ring.material.dispose();
          this.bursts.splice(i, 1);
          continue;
        }
        const pos = b.sparks.geometry.attributes.position;
        for (let j = 0; j < b.velocities.length; j++) {
          const v = b.velocities[j];
          v.multiplyScalar(1 - delta * 2.4);
          pos.setXYZ(j, pos.getX(j) + v.x * delta, pos.getY(j) + v.y * delta, pos.getZ(j) + v.z * delta);
        }
        pos.needsUpdate = true;
        b.sparks.material.uniforms.opacity.value = 1 - t;
        // Ring: fast exponential ease-out
        const grow = 1 - Math.pow(2, -8 * t);
        b.ring.scale.setScalar(b.size * (0.4 + grow * 3.2));
        b.ring.material.opacity = (1 - t) * 0.8;
      }
    },

    onResize() {},

    dispose(scene) {
      [...this.asteroids, ...this.fragments].forEach((a) => scene.remove(a.mesh));
      this.bursts.forEach((b) => {
        scene.remove(b.sparks);
        scene.remove(b.ring);
      });
      this.geometries.forEach((g) => g.dispose());
      this.fragmentGeometry.dispose();
      this.ringGeometry.dispose();
      this.material.dispose();
      this.badge?.remove();
      this.asteroids = [];
      this.fragments = [];
      this.bursts = [];
    },
  };
}
