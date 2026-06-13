// Celebration effects - confetti, particles, animations
// Uses Phaser's built-in Particle Emitter for better performance and automatic cleanup

import { GameObjects, Scene } from 'phaser';

export interface CelebrationConfig {
  x: number;
  y: number;
  color?: number;
  count?: number;
  duration?: number;
}

export class Celebration {
  private scene: Scene;
  private activeEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];
  private isShutdown: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    // Listen for scene shutdown to clean up
    this.scene.events.once('shutdown', () => this.cleanup());
    this.scene.events.once('destroy', () => this.cleanup());
  }

  // Confetti burst using Particle Emitter
  burst(config: CelebrationConfig): void {
    if (this.isShutdown) return;
    const { x, y, color = 0xffd700, count = 30, duration = 2000 } = config;
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xd1a3ff, 0xffbe76, 0xffd700];

    // Create a texture for particles if not exists
    const textureKey = 'celebration_particle';
    if (!this.scene.textures.exists(textureKey)) {
      const gfx = this.scene.add.graphics();
      const colors_arr = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xd1a3ff, 0xffbe76, 0xffd700];
      for (let i = 0; i < colors_arr.length; i++) {
        gfx.fillStyle(colors_arr[i]);
        gfx.fillCircle(8 + i * 16, 8, 8);
      }
      gfx.generateTexture(textureKey, 16 * colors_arr.length, 16);
      gfx.destroy();
    }

    const emitter = this.scene.add.particles(x, y, textureKey, {
      frame: colors.map((c, i) => i), // use different frames for different colors
      lifespan: duration,
      speed: { min: 50, max: 200 },
      angle: { min: -120, max: -60 }, // upward burst
      gravityY: 200,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: count,
      blendMode: 'ADD',
      emitting: false
    });

    this.activeEmitters.push(emitter);
    emitter.explode(count, x, y);

    // Auto-cleanup after duration
    this.scene.time.delayedCall(duration + 100, () => {
      if (emitter && !this.isShutdown) {
        emitter.destroy();
        this.activeEmitters = this.activeEmitters.filter(e => e !== emitter);
      }
    });
  }

  // Star burst for completion
  starBurst(x: number, y: number): void {
    if (this.isShutdown) return;
    const starCount = 20;

    // Create star texture if not exists
    const textureKey = 'celebration_star';
    if (!this.scene.textures.exists(textureKey)) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xffd700, 1);
      gfx.lineStyle(2, 0xffaa00, 1);
      const spikes = 5;
      const outerRadius = 12;
      const innerRadius = 5;
      gfx.beginPath();
      for (let j = 0; j < spikes * 2; j++) {
        const radius = j % 2 === 0 ? outerRadius : innerRadius;
        const angle = (j * Math.PI) / spikes - Math.PI / 2;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;
        if (j === 0) gfx.moveTo(sx, sy);
        else gfx.lineTo(sx, sy);
      }
      gfx.closePath();
      gfx.fillPath();
      gfx.strokePath();
      gfx.generateTexture(textureKey, 32, 32);
      gfx.destroy();
    }

    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan: 1500,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      gravityY: 100,
      scale: { start: 0.5, end: 0 },
      rotate: { start: 0, end: 360 },
      alpha: { start: 1, end: 0 },
      quantity: starCount,
      blendMode: 'ADD',
      emitting: false
    });

    this.activeEmitters.push(emitter);
    emitter.explode(starCount, x, y);

    this.scene.time.delayedCall(1600, () => {
      if (emitter && !this.isShutdown) {
        emitter.destroy();
        this.activeEmitters = this.activeEmitters.filter(e => e !== emitter);
      }
    });
  }

  // Screen flash effect
  flash(color: number = 0xffffff, duration: number = 200): void {
    if (this.isShutdown) return;
    const { width, height } = this.scene.scale;
    const flash = this.scene.add.graphics();
    flash.fillStyle(color, 0.5);
    flash.fillRect(0, 0, width, height);
    flash.setDepth(1000);

    const tween = this.scene.tweens.add({
      targets: flash,
      alpha: { from: 0.5, to: 0 },
      duration,
      onComplete: () => {
        flash.destroy();
        this.activeTweens = this.activeTweens.filter(t => t !== tween);
      }
    });
    this.activeTweens.push(tween);
  }

  // Floating text animation
  floatingText(x: number, y: number, text: string, color: string = '#4ade80', fontSize: string = '32px'): void {
    if (this.isShutdown) return;
    const txt = this.scene.add.text(x, y, text, {
      fontSize,
      color,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    const tween = this.scene.tweens.add({
      targets: txt,
      y: y - 80,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => {
        txt.destroy();
        this.activeTweens = this.activeTweens.filter(t => t !== tween);
      }
    });
    this.activeTweens.push(tween);
  }

  cleanup(): void {
    this.isShutdown = true;
    // Destroy all active emitters
    this.activeEmitters.forEach(e => {
      try { e.destroy(); } catch {}
    });
    this.activeEmitters = [];
    // Stop all active tweens
    this.activeTweens.forEach(t => {
      try { t.stop(); } catch {}
    });
    this.activeTweens = [];
  }
}