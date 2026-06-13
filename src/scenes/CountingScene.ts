import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { Celebration } from '../utils/Celebration';
import { accessibility } from '../utils/Accessibility';

export class CountingScene extends Scene {
  private numbers: GameObjects.Text[] = [];
  private currentNumber: number = 1;
  private starsEarned: number = 0;
  private feedbackText!: GameObjects.Text;
  private celebration!: Celebration;
  private numberContainers: Map<number, GameObjects.Container> = new Map();
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    super({ key: 'CountingScene', active: false });
  }

  create(): void {
    this.celebration = new Celebration(this);
    this.createBackground();
    this.createBackButton();
    this.createNumbers();
    this.createFeedback();
    this.speakNumber(this.currentNumber);
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xff9a9e, 0xff9a9e, 0xfecfef, 0xfecfef, 1);
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
    
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      this.scene.start('MainMenuScene');
    });
  }

  private createNumbers(): void {
    const { width, height } = this.scale;
    const cols = 5;
    const spacingX = width / (cols + 1);
    const startY = height / 2 - 50;

    for (let i = 0; i < 10; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacingX * (col + 1);
      const y = startY + row * 120;
      const num = i + 1;

      const circle = this.add.graphics();
      circle.fillStyle(num <= this.currentNumber ? 0x4ade80 : 0xffffff, 0.3);
      circle.fillCircle(0, 0, 50);
      circle.lineStyle(3, num <= this.currentNumber ? 0x4ade80 : 0xaaa, 1);
      circle.strokeCircle(0, 0, 50);

      const text = this.add.text(0, 0, num.toString(), {
        fontSize: '36px',
        color: '#333',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const container = this.add.container(x, y);
      container.add([circle, text]);
      container.setSize(100, 100);
      container.setData('number', num);
      
      this.numberContainers.set(num, container);

      if (num === this.currentNumber) {
        this.enableNumberInteraction(container, num);
      } else if (num < this.currentNumber) {
        // Completed numbers - green check
        const check = this.add.text(0, 0, '✓', { fontSize: '36px', color: '#4ade80' }).setOrigin(0.5);
        container.add(check);
      }

      this.numbers.push(text);
    }
  }

  private enableNumberInteraction(container: GameObjects.Container, num: number): void {
    container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
    
    const pointerDownHandler = () => this.onNumberTap(num, container);
    const touchStartHandler = () => this.onNumberTap(num, container);
    
    container.on('pointerdown', pointerDownHandler);
    container.on('touchstart', touchStartHandler);
    
    // Store handlers for cleanup
    container.setData('pointerDownHandler', pointerDownHandler);
    container.setData('touchStartHandler', touchStartHandler);

    // Pulse animation (respects reduced motion)
    if (!accessibility.shouldReduceMotion()) {
      this.tweens.add({
        targets: container,
        scale: { from: 1, to: 1.12 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createFeedback(): void {
    const { width, height } = this.scale;
    this.feedbackText = this.add.text(width / 2, height - 80, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  private onNumberTap(num: number, container: GameObjects.Container): void {
    if (num !== this.currentNumber) return;

    this.tweens.killTweensOf(container);
    soundManager.playNumber(num);
    soundManager.playClick();
    haptics.light();
    this.speakNumber(num);
    
    this.feedbackText.setText(`Great! That's ${num}!`).setVisible(true);
    this.celebration.floatingText(container.x, container.y - 60, `+${num}!`, '#4ade80', '28px');
    this.time.delayedCall(1500, () => {
      if (this.feedbackText && this.feedbackText.active) {
        this.feedbackText.setVisible(false);
      }
    });

    // Add checkmark with pop animation
    const check = this.add.text(0, 0, '✓', { fontSize: '36px', color: '#4ade80' }).setOrigin(0.5);
    container.add(check);
    if (!accessibility.shouldReduceMotion()) {
      this.tweens.add({
        targets: check,
        scale: { from: 0, to: 1.2 },
        duration: accessibility.getDuration(200),
        ease: 'Back.easeOut'
      });
    }
    container.disableInteractive();

    this.currentNumber++;
    
    if (this.currentNumber <= 10) {
      // Enable next number
      this.time.delayedCall(500, () => {
        const nextContainer = this.numberContainers.get(this.currentNumber);
        if (nextContainer && nextContainer.active) {
          this.enableNumberInteraction(nextContainer, this.currentNumber);
          
          // Update circle color
          const circle = nextContainer.getAt(0) as GameObjects.Graphics;
          circle.clear();
          circle.fillStyle(0x4ade80, 0.3);
          circle.fillCircle(0, 0, 50);
          circle.lineStyle(3, 0x4ade80, 1);
          circle.strokeCircle(0, 0, 50);
        }
      });
    } else {
      // All done!
      this.starsEarned = 3;
      this.showCompletion();
    }
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    const container = this.add.container(width / 2, height / 2);
    
    // Success sound and haptics
    soundManager.playSuccess();
    haptics.success();
    
    // Celebration effects
    if (!accessibility.shouldReduceMotion()) {
      this.celebration.starBurst(width / 2, height / 2);
      this.celebration.flash(0xffff00, 300);
    }
    this.celebration.floatingText(width / 2, height / 2 - 100, 'Amazing!', '#ffd700', '40px');

    const starsText = this.add.text(0, -60, '⭐⭐⭐', { fontSize: '60px' }).setOrigin(0.5);
    
    this.add.text(0, 20, 'Amazing! You counted to 10!', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(0, 100, 'Back to Menu', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 },
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      updateGameProgress('counting', this.starsEarned);
      this.scene.start('MainMenuScene');
    });

    container.add([starsText]);
    
    // Announce for screen readers
    accessibility.announce('Congratulations! You counted to ten!');
  }

  private speakNumber(num: number): void {
    if ('speechSynthesis' in window) {
      // Cancel any pending speech
      speechSynthesis.cancel();
      this.speechUtterance = new SpeechSynthesisUtterance(num.toString());
      this.speechUtterance.rate = 0.8;
      this.speechUtterance.pitch = 1.2;
      this.speechUtterance.lang = 'en-US';
      speechSynthesis.speak(this.speechUtterance);
    }
  }

  shutdown(): void {
    this.cleanup();
  }

  private cleanup(): void {
    // Cancel speech synthesis
    if (this.speechUtterance) {
      speechSynthesis.cancel();
      this.speechUtterance = null;
    }
    
    // Remove event listeners from all number containers
    this.numberContainers.forEach((container) => {
      if (container && container.active) {
        const pointerDownHandler = container.getData('pointerDownHandler');
        const touchStartHandler = container.getData('touchStartHandler');
        if (pointerDownHandler) container.off('pointerdown', pointerDownHandler);
        if (touchStartHandler) container.off('touchstart', touchStartHandler);
      }
    });
    this.numberContainers.clear();
    
    // Cancel all pending delayed calls and tweens
    this.time.removeAllEvents();
    this.tweens.killAll();
    
    // Cleanup celebration
    this.celebration?.cleanup();
  }
}