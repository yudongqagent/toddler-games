import { Scene, GameObjects, Input } from 'phaser';
import { updateGameProgress } from '../utils/GameData';

const COLORS = [
  { name: 'Red', value: 0xff6b6b, light: 0xffa8a8 },
  { name: 'Blue', value: 0x4ecdc4, light: 0x9df3ec },
  { name: 'Yellow', value: 0xffe66d, light: 0xfff3a8 },
  { name: 'Green', value: 0x95e1d3, light: 0xc8f0e1 },
  { name: 'Purple', value: 0xd1a3ff, light: 0xe8d0ff },
  { name: 'Orange', value: 0xffbe76, light: 0xffdfb8 }
];

export class ColorMatchScene extends Scene {
  private targetColor: { name: string; value: number } = COLORS[0];
  private colorCircles: GameObjects.Container[] = [];
  private score: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;

  constructor() {
    super({ key: 'ColorMatchScene', active: false });
  }

  create(): void {
    this.createBackground();
    this.createBackButton();
    this.createScoreDisplay();
    this.createFeedback();
    this.newRound();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xa8edea, 0xa8edea, 0xfed6e3, 0xfed6e3, 1);
    graphics.fillRect(0, 0, width, height);
  }

  private createBackButton(): void {
    const btn = this.add.text(40, 40, '← Back', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { x: 16, y: 8 },
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerup', () => this.scene.start('MainMenuScene'));
  }

  private createScoreDisplay(): void {
    const { width } = this.scale;
    this.scoreText = this.add.text(width / 2, 40, 'Match the color: 0/6', {
      fontSize: '28px',
      color: '#333',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5);
  }

  private createFeedback(): void {
    const { width, height } = this.scale;
    this.feedbackText = this.add.text(width / 2, height - 100, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  private newRound(): void {
    this.colorCircles.forEach(c => c.destroy());
    this.colorCircles = [];

    // Pick target color
    const available = COLORS.filter(c => !this.colorCircles.some(cc => (cc.getData('color') as any)?.name === c.name));
    this.targetColor = available[Math.floor(Math.random() * available.length)];

    this.scoreText.setText(`Match the color: ${this.score}/6`);

    // Show target color name at top
    const { width, height } = this.scale;
    const targetDisplay = this.add.container(width / 2, 120);
    
    const label = this.add.text(0, -40, 'Find:', { fontSize: '22px', color: '#333', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
    const colorName = this.add.text(0, 0, this.targetColor.name, { 
      fontSize: '36px', 
      color: '#ffffff', 
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const swatch = this.add.graphics();
    swatch.fillStyle(this.targetColor.value, 1);
    swatch.fillCircle(0, 60, 40);
    swatch.lineStyle(4, 0xffffff, 1);
    swatch.strokeCircle(0, 60, 40);
    
    targetDisplay.add([label, colorName, swatch]);
    this.colorCircles.push(targetDisplay);

    // Create color options (3x2 grid)
    const options = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 6);
    const cols = 3;
    const rows = 2;
    const spacingX = width / (cols + 1);
    const startY = height / 2 + 20;

    options.forEach((color, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacingX * (col + 1);
      const y = startY + row * 110;

      const container = this.add.container(x, y);
      
      const circle = this.add.graphics();
      circle.fillStyle(color.value, 1);
      circle.fillCircle(0, 0, 50);
      circle.lineStyle(4, 0xffffff, 1);
      circle.strokeCircle(0, 0, 50);

      container.add(circle);
      container.setData('color', color);
      container.setSize(100, 100);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
      
      container.on('pointerdown', () => this.onColorTap(container, color));
      container.on('touchstart', () => this.onColorTap(container, color));

      this.colorCircles.push(container);
    });
  }

  private onColorTap(container: GameObjects.Container, color: typeof COLORS[0]): void {
    container.disableInteractive();
    
    if (color.name === this.targetColor.name) {
      // Correct!
      this.score++;
      this.feedbackText.setText('Correct! 🎉').setColor('#4ade80').setVisible(true);
      
      // Checkmark
      const check = this.add.text(0, 0, '✓', { fontSize: '48px', color: '#4ade80' }).setOrigin(0.5);
      container.add(check);
      
      // Pop animation
      this.tweens.add({
        targets: container,
        scale: { from: 1, to: 1.3 },
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      if (this.score >= 6) {
        this.time.delayedCall(1000, () => this.showCompletion());
      } else {
        this.time.delayedCall(1000, () => {
          this.feedbackText.setVisible(false);
          this.newRound();
        });
      }
    } else {
      // Wrong
      this.feedbackText.setText('Try again!').setColor('#ff6b6b').setVisible(true);
      this.tweens.add({
        targets: container,
        x: { from: container.x, to: container.x - 10 },
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains)
      });
    }
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    const stars = this.score >= 6 ? 3 : this.score >= 4 ? 2 : 1;
    this.starsEarned = stars;
    
    const starsText = '⭐'.repeat(stars);
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 60, starsText, { fontSize: '60px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'Perfect! All colors matched!', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 },
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      updateGameProgress('colors', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
  }
}