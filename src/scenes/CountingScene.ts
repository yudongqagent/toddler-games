import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';

export class CountingScene extends Scene {
  private numbers: GameObjects.Text[] = [];
  private currentNumber: number = 1;
  private starsEarned: number = 0;
  private feedbackText!: GameObjects.Text;

  constructor() {
    super({ key: 'CountingScene', active: false });
  }

  create(): void {
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
    
    btn.on('pointerup', () => this.scene.start('MainMenuScene'));
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
      
      if (num === this.currentNumber) {
        container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
        container.on('pointerdown', () => this.onNumberTap(num, container));
        container.on('touchstart', () => this.onNumberTap(num, container));
        
        // Pulse animation
        this.tweens.add({
          targets: container,
          scale: { from: 1, to: 1.15 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else if (num < this.currentNumber) {
        // Completed numbers - green check
        const check = this.add.text(0, 0, '✓', { fontSize: '36px', color: '#4ade80' }).setOrigin(0.5);
        container.add(check);
      }

      this.numbers.push(text);
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
    this.speakNumber(num);
    
    this.feedbackText.setText(`Great! That's ${num}!`).setVisible(true);
    this.time.delayedCall(1500, () => {
      this.feedbackText.setVisible(false);
    });

    // Add checkmark
    const check = this.add.text(0, 0, '✓', { fontSize: '36px', color: '#4ade80' }).setOrigin(0.5);
    container.add(check);
    container.disableInteractive();

    this.currentNumber++;
    
    if (this.currentNumber <= 10) {
      // Enable next number
      this.time.delayedCall(500, () => {
        const children = this.children.list;
        let nextContainer: GameObjects.Container | null = null;
        for (const c of children) {
          if (c instanceof GameObjects.Container) {
            const textObj = c.getAt(1);
            if (textObj instanceof GameObjects.Text && textObj.text === this.currentNumber.toString()) {
              nextContainer = c;
              break;
            }
          }
        }
        if (nextContainer) {
          nextContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
          nextContainer.on('pointerdown', () => this.onNumberTap(this.currentNumber, nextContainer));
          nextContainer.on('touchstart', () => this.onNumberTap(this.currentNumber, nextContainer));
          
          this.tweens.add({
            targets: nextContainer,
            scale: { from: 1, to: 1.15 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          
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
      updateGameProgress('counting', this.starsEarned);
      this.scene.start('MainMenuScene');
    });

    container.add([starsText]);
  }

  private speakNumber(num: number): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(num.toString());
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.lang = 'en-US';
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }
}