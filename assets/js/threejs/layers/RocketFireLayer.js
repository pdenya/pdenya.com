/**
 * RocketFireLayer.js - Exhaust flame effect for rockets
 * Particle-based fire that attaches to the bottom of a rocket model
 */
import * as THREE from 'three';

export const RocketFire = {
  particles: [],
  group: null,
  clock: null,
  geometry: null,
  texture: null,
  rocketRadius: 1,

  config: {
    particleCount: 200,
    colors: [
      new THREE.Color(0xffffff),  // White core
      new THREE.Color(0xffff88),  // Bright yellow
      new THREE.Color(0xffaa33),  // Orange
      new THREE.Color(0xff4400),  // Red-orange
      new THREE.Color(0x881100),  // Dark red
    ],
    minSpeed: 4,
    maxSpeed: 8,
    minLife: 0.6,
    maxLife: 1.2,
    startSize: 1.2,
    endSize: 0.3,     // Shrink as they fade
    spread: 0.2,
    turbulence: 0.5,
    converge: 0.9,    // How much particles converge to center (0-1)
  },

  init(parentGroup, rocketBottomY, rocketRadius) {
    this.clock = new THREE.Clock();
    this.group = new THREE.Group();
    this.group.position.y = rocketBottomY - 0.3;
    this.particles = [];
    this.rocketRadius = rocketRadius;
    this.coreFlames = [];

    this.geometry = new THREE.PlaneGeometry(1, 1);

    // Soft radial gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    this.texture = new THREE.CanvasTexture(canvas);

    // Create permanent core flames at the base
    this._createCoreFlames();

    for (let i = 0; i < this.config.particleCount; i++) {
      this._spawnParticle(Math.random());
    }

    parentGroup.add(this.group);
  },

  _createCoreFlames() {
    const coreCount = 5;
    const baseRadius = this.rocketRadius * 0.5;

    for (let i = 0; i < coreCount; i++) {
      const angle = (i / coreCount) * Math.PI * 2;
      const isCenter = i === 0;

      const material = new THREE.MeshBasicMaterial({
        map: this.texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: isCenter ? 0xffffff : 0xffdd66,
      });

      const mesh = new THREE.Mesh(this.geometry, material);

      if (isCenter) {
        mesh.position.set(0, -0.5, 0);
        mesh.scale.set(2.5, 3.0, 1);
      } else {
        const r = baseRadius * 0.6;
        mesh.position.set(Math.cos(angle) * r, -0.3, Math.sin(angle) * r);
        mesh.scale.set(1.8, 2.2, 1);
      }

      this.coreFlames.push({ mesh, material, baseScale: mesh.scale.clone(), phase: Math.random() * Math.PI * 2 });
      this.group.add(mesh);
    }
  },

  _spawnParticle(initialProgress = 0) {
    const { colors, minSpeed, maxSpeed, minLife, maxLife, startSize, spread } = this.config;

    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(this.geometry, material);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * this.rocketRadius * 0.7;
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.position.y = 0;

    const particle = {
      mesh,
      material,
      life: minLife + Math.random() * (maxLife - minLife),
      age: initialProgress * (minLife + Math.random() * (maxLife - minLife)),
      speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      xOffset: (Math.random() - 0.5) * spread,
      zOffset: (Math.random() - 0.5) * spread,
      turbulencePhase: Math.random() * Math.PI * 2,
      startX: mesh.position.x,
      startZ: mesh.position.z,
    };

    this.particles.push(particle);
    this.group.add(mesh);
  },

  update(delta) {
    if (!this.group) return;

    const { colors, startSize, endSize, turbulence, converge } = this.config;
    const time = this.clock.getElapsedTime();

    // Animate core flames with flicker
    for (const core of this.coreFlames) {
      const flicker = 0.9 + Math.sin(time * 15 + core.phase) * 0.1 + Math.sin(time * 23 + core.phase * 2) * 0.05;
      core.mesh.scale.x = core.baseScale.x * flicker;
      core.mesh.scale.y = core.baseScale.y * (0.95 + Math.sin(time * 12 + core.phase) * 0.08);
      core.material.opacity = 0.7 + Math.sin(time * 18 + core.phase) * 0.15;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += delta;

      const progress = Math.min(p.age / p.life, 1);

      p.mesh.position.y = -p.age * p.speed;

      // Converge toward center as progress increases
      const convergeFactor = 1 - (progress * converge);
      const wiggle = Math.sin(time * 10 + p.turbulencePhase) * turbulence * (1 - progress);
      p.mesh.position.x = p.startX * convergeFactor + wiggle * 0.2;
      p.mesh.position.z = p.startZ * convergeFactor;

      // Shrink as particles age
      const scale = startSize + (endSize - startSize) * progress;
      p.mesh.scale.set(scale, scale, 1);

      const colorIndex = progress * (colors.length - 1);
      const colorLow = Math.floor(colorIndex);
      const colorHigh = Math.min(colorLow + 1, colors.length - 1);
      const colorMix = colorIndex - colorLow;
      p.material.color = colors[colorLow].clone().lerp(colors[colorHigh], colorMix);

      // Fade out starting earlier for longer tail
      const fadeStart = 0.4;
      const opacity = progress > fadeStart ? 1 - ((progress - fadeStart) / (1 - fadeStart)) : 1;
      p.material.opacity = opacity * 0.85;

      if (progress >= 1) {
        this.group.remove(p.mesh);
        p.material.dispose();
        this.particles.splice(i, 1);
        this._spawnParticle(0);
      }
    }
  },

  dispose() {
    if (this.group) {
      this.particles.forEach(p => p.material.dispose());
      this.particles = [];
      this.coreFlames.forEach(c => c.material.dispose());
      this.coreFlames = [];
      if (this.geometry) this.geometry.dispose();
      if (this.texture) this.texture.dispose();
    }
  }
};
