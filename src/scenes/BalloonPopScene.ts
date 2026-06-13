import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { accessibility } from '../utils/Accessibility';

const BALLOON_COLORS = [
  0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xd1a3ff, 0xffbe76
];

interface Balloon {
  container: GameObjects.Container;
  color: number;
  popped: boolean;
  pointerDownHandler?: () => void;
  touchStartHandler?: () => void;
}

export class BalloonPopScene extends Scene {
  private balloons: Balloon[] = [];
  private score: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private isShutdown: boolean = false;

  constructor() {
    super({ key: 'BalloonPopScene', active: false });
  }

  create(): void {
    this.createBackground();
    this.createBackButton();
    this.createScoreDisplay();
    this.createFeedback();
    this.startSpawning();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x89f7fe, 0x89f7fe, 0x66a6ff, 0x66a6ff, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Clouds
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.6);
      const cx = Phaser.Math.Between(0, width);
      const cy = Phaser.Math.Between(0, height * 0.3);
      cloud.fillEllipse(cx, cy, 80, 40);
      cloud.fillEllipse(cx + 30, cy, 60, 35);
      cloud.fillEllipse(cx - 30, cy, 60, 35);
    }
  }

  private createBackButton(): void {
    const btn = this.add.text(40, 40, '← Back', {
      fontSize: '24px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { x: 16, y: 8 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerup', () => this.cleanupAndExit());
  }

  private createScoreDisplay(): void {
    const { width } = this.scale;
    this.scoreText = this.add.text(width / 2, 40, 'Pop balloons: 0', {
      fontSize: '32px', color: '#333', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }

  private createFeedback(): void {
    const { width, height } = this.scale;
    this.feedbackText = this.add.text(width / 2, height - 80, '', {
      fontSize: '24px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);
  }

  private startSpawning(): void {
    if (this.isShutdown) return;
    this.spawnTimer = this.time.addEvent({
      delay: 1200,
      callback: this.spawnBalloon,
      callbackScope: this,
      loop: true
    });
    // Spawn first few immediately
    for (let i = 0; i < 3; i++) this.time.delayedCall(i * 300, () => this.spawnBalloon());
  }

  private spawnBalloon(): void {
    if (this.isShutdown) return;
    if (this.balloons.filter(b => !b.popped).length >= 8) return;
    if (this.score >= 20) { this.showCompletion(); return; }

    const { width, height } = this.scale;
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const x = Phaser.Math.Between(60, width - 60);
    const y = height + 60;

    const container = this.add.container(x, y);
    
    const balloon = this.add.graphics();
    balloon.fillStyle(color, 1);
    balloon.fillEllipse(0, 0, 35, 50);
    balloon.fillCircle(0, 28, 12); // knot
    balloon.lineStyle(2, this.darkenColor(color), 1);
    balloon.strokeEllipse(0, 0, 35, 50);
    
    const string = this.add.graphics();
    string.lineStyle(2, 0x666, 1);
    string.beginPath();
    string.moveTo(0, 28);
    string.lineTo(0, 50);
    string.strokePath();

    container.add([balloon, string]);
    container.setSize(70, 100);
    container.setInteractive(new Phaser.Geom.Ellipse(0, 0, 35, 50), Phaser.Geom.Ellipse.Contains);
    
    const balloonData: Balloon = { container, color, popped: false };
    container.setData('balloonData', balloonData);
    
    // Store handlers for cleanup
    const pointerDownHandler = () => this.popBalloon(balloonData);
    const touchStartHandler = () => this.popBalloon(balloonData);
    container.on('pointerdown', pointerDownHandler);
    container.on('touchstart', touchStartHandler);
    balloonData.pointerDownHandler = pointerDownHandler;
    balloonData.touchStartHandler = touchStartHandler;

    // Float up animation
    this.tweens.add({
      targets: container,
      y: Phaser.Math.Between(height * 0.2, height * 0.7),
      x: x + Phaser.Math.Between(-30, 30),
      duration: 2000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (!this.isShutdown && !balloonData.popped) {
          this.driftBalloon(container, balloonData);
        }
      }
    });

    // Auto-remove after time
    this.time.delayedCall(10000, () => {
      if (!this.isShutdown && !balloonData.popped && container.active) {
        this.tweens.add({
          targets: container, alpha: 0, duration: 500,
          onComplete: () => this.removeBalloon(balloonData)
        });
      }
    });

    this.balloons.push(balloonData);
  }

  private driftBalloon(container: GameObjects.Container, data: Balloon): void {
    if (this.isShutdown || data.popped || !container.active) return;
    
    this.tweens.add({
      targets: container,
      x: container.x + Phaser.Math.Between(-50, 50),
      y: container.y + Phaser.Math.Between(-30, 30),
      duration: 3000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.isShutdown && !data.popped && container.active) {
          this.driftBalloon(container, data);
        }
      }
    });
  }

  private popBalloon(data: Balloon): void {
    if (data.popped || this.isShutdown) return;
    data.popped = true;
    this.score++;
    this.scoreText.setText(`Pop balloons: ${this.score}`);

    // Pop animation
    this.tweens.add({
      targets: data.container,
      scale: { from: 1, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => this.removeBalloon(data)
    });

    // Particles
    this.createPopParticles(data.container.x, data.container.y, data.color);
    
    // Score popup
    const popup = this.add.text(data.container.x, data.container.y, `+1`, {
      fontSize: '28px', color: '#4ade80', fontFamily: 'Arial, sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: popup, y: popup.y - 50, alpha: 0, duration: 800, onComplete: () => popup.destroy() });

    this.feedbackText.setText(`Pop! ${this.score}`).setColor('#4ade80').setVisible(true);
    this.time.delayedCall(500, () => { if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false); });
  }

  private createPopParticles(x: number, y: number, color: number): void {
    for (let i = 0; i < 8; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 4);
      particle.x = x;
      particle.y = y;
      
      const angle = (i / 8) * Math.PI * 2;
      const distance = 60;
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  private removeBalloon(data: Balloon): void {
    // Remove event listeners
    if (data.container && data.container.active) {
      if (data.pointerDownHandler) data.container.off('pointerdown', data.pointerDownHandler);
      if (data.touchStartHandler) data.container.off('touchstart', data.touchStartHandler);
      data.container.destroy();
    }
    this.balloons = this.balloons.filter(b => b !== data);
  }

  private darkenColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    return ((Math.max(0, r - 40) << 16) | (Math.max(0, g - 40) << 8) | Math.max(0, b - 40));
  }

  private showCompletion(): void {
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.cleanupBalloons();
    
    const { width, height } = this.scale;
    this.starsEarned = this.score >= 20 ? 3 : this.score >= 15 ? 2 : 1;
    
    const starsText = Array(this.starsEarned + 1).join('⭐');
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 60, starsText, { fontSize: '60px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, `You popped ${this.score} balloons!`, {
      fontSize: '28px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
      fontSize: '24px', color: '#fff', backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      updateGameProgress('balloons', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
  }

  private cleanupBalloons(): void {
    this.balloons.forEach(b => {
      if (b.container && b.container.active) {
        if (b.pointerDownHandler) b.container.off('pointerdown', b.pointerDownHandler);
        if (b.touchStartHandler) b.container.off('touchstart', b.touchStartHandler);
        b.container.destroy();
      }
    });
    this.balloons = [];
  }

  private cleanupAndExit(): void {
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.cleanupBalloons();
    this.scene.start('MainMenuScene');
  }

  shutdown(): void {
    this.isShutdown = true;
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.cleanupBalloons();
    this.time.removeAllEvents();
    this.tweens.killAll();
  }
}