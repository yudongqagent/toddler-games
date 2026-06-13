import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { Celebration } from '../utils/Celebration';
import { accessibility } from '../utils/Accessibility';

const ANIMALS = [
  { name: 'Cow', emoji: '🐄', sound: 'Moo', color: 0x8b7355 },
  { name: 'Pig', emoji: '🐷', sound: 'Oink', color: 0xf4a6c1 },
  { name: 'Chicken', emoji: '🐔', sound: 'Cluck', color: 0xffd93d },
  { name: 'Sheep', emoji: '🐑', sound: 'Baa', color: 0xf5f5f5 },
  { name: 'Horse', emoji: '🐎', sound: 'Neigh', color: 0x8b4513 },
  { name: 'Duck', emoji: '🦆', sound: 'Quack', color: 0xffd700 },
  { name: 'Dog', emoji: '🐕', sound: 'Woof', color: 0x8b5a2b },
  { name: 'Cat', emoji: '🐱', sound: 'Meow', color: 0x808080 }
];

export class AnimalSoundsScene extends Scene {
  private animalCards: GameObjects.Container[] = [];
  private score: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;
  private currentAnimal: typeof ANIMALS[0] | null = null;
  private celebration!: Celebration;
  private animalTapHandlers: Map<GameObjects.Container, () => void> = new Map();
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    super({ key: 'AnimalSoundsScene', active: false });
  }

  create(): void {
    this.celebration = new Celebration(this);
    this.createBackground();
    this.createBackButton();
    this.createScoreDisplay();
    this.createFeedback();
    this.newRound();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xfdbb2d, 0xfdbb2d, 0x22c1c3, 0x22c1c3, 1);
    graphics.fillRect(0, 0, width, height);
  }

  private createBackButton(): void {
    const btn = this.add.text(40, 40, '← Back', {
      fontSize: '24px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { x: 16, y: 8 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      this.scene.start('MainMenuScene');
    });
  }

  private createScoreDisplay(): void {
    const { width } = this.scale;
    this.scoreText = this.add.text(width / 2, 40, 'Find the animal: 0/8', {
      fontSize: '28px', color: '#333', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 16, y: 8 }
    }).setOrigin(0.5);
  }

  private createFeedback(): void {
    const { width, height } = this.scale;
    this.feedbackText = this.add.text(width / 2, height - 100, '', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  private newRound(): void {
    this.animalCards.forEach(c => c.destroy());
    this.animalCards = [];

    const available = ANIMALS.filter(a => !this.animalCards.some(ac => (ac.getData('animal') as any)?.name === a.name));
    if (available.length === 0) {
      this.showCompletion();
      return;
    }

    this.currentAnimal = available[Math.floor(Math.random() * available.length)];
    this.scoreText.setText(`Find the animal: ${this.score}/8`);

    // Show target at top
    const { width, height } = this.scale;
    const targetDisplay = this.add.container(width / 2, 120);
    
    this.add.text(0, -50, 'Listen & Find:', { fontSize: '22px', color: '#333', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
    
    const emoji = this.add.text(0, 10, this.currentAnimal.emoji, { fontSize: '60px' }).setOrigin(0.5);
    const nameText = this.add.text(0, 75, this.currentAnimal.name, { 
      fontSize: '28px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    
    this.speakAnimal(this.currentAnimal);
    
    targetDisplay.add([emoji, nameText]);
    this.animalCards.push(targetDisplay);

    // Options grid
    const options = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 6);
    const cols = 3;
    const spacingX = width / (cols + 1);
    const startY = height / 2 + 20;

    options.forEach((animal, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacingX * (col + 1);
      const y = startY + row * 110;

      const container = this.add.container(x, y);
      
      const bg = this.add.graphics();
      bg.fillStyle(animal.color, 0.3);
      bg.fillRoundedRect(-60, -60, 120, 120, 20);
      bg.lineStyle(3, animal.color, 1);
      bg.strokeRoundedRect(-60, -60, 120, 120, 20);
      
      const emojiText = this.add.text(0, -15, animal.emoji, { fontSize: '50px' }).setOrigin(0.5);
      const nameText = this.add.text(0, 40, animal.name, { 
        fontSize: '18px', color: '#333', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' 
      }).setOrigin(0.5);
      
      container.add([bg, emojiText, nameText]);
      container.setData('animal', animal);
      container.setSize(120, 120);
      container.setInteractive(new Phaser.Geom.Rectangle(-60, -60, 120, 120), Phaser.Geom.Rectangle.Contains);
      
      const handler = () => this.onAnimalTap(container, animal);
      this.animalTapHandlers.set(container, handler);
      
      container.on('pointerdown', handler);
      container.on('touchstart', handler);

      this.animalCards.push(container);
    });
  }

  private onAnimalTap(container: GameObjects.Container, animal: typeof ANIMALS[0]): void {
    // Remove handler to prevent double-tap
    const handler = this.animalTapHandlers.get(container);
    if (handler) {
      container.off('pointerdown', handler);
      container.off('touchstart', handler);
      this.animalTapHandlers.delete(container);
    }
    container.disableInteractive();
    
    if (animal.name === this.currentAnimal?.name) {
      this.score++;
      soundManager.playSuccess();
      haptics.medium();
      this.feedbackText.setText(`${animal.name} says ${animal.sound}! 🎉`).setColor('#4ade80').setVisible(true);
      this.speakAnimal(animal);
      this.celebration.floatingText(container.x, container.y - 60, 'Correct!', '#4ade80', '32px');
      if (!accessibility.shouldReduceMotion()) {
        this.celebration.burst({ x: container.x, y: container.y, count: 12 });
      }
      
      const check = this.add.text(0, 0, '✓', { fontSize: '48px', color: '#4ade80' }).setOrigin(0.5);
      container.add(check);
      
      if (this.score >= ANIMALS.length - 2) { // Stop when most found
        this.time.delayedCall(1000, () => this.showCompletion());
      } else {
        this.time.delayedCall(1200, () => {
          if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false);
          this.newRound();
        });
      }
    } else {
      soundManager.playError();
      haptics.error();
      this.feedbackText.setText(`That's ${animal.name} (${animal.sound})`).setColor('#ff6b6b').setVisible(true);
      this.speakAnimal(animal);
      
      if (!accessibility.shouldReduceMotion()) {
        this.tweens.add({
          targets: container, x: { from: container.x, to: container.x - 10 },
          duration: accessibility.getDuration(100), yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
          onComplete: () => {
            container.setInteractive(new Phaser.Geom.Rectangle(-60, -60, 120, 120), Phaser.Geom.Rectangle.Contains);
            // Re-attach handler
            const newHandler = () => this.onAnimalTap(container, animal);
            this.animalTapHandlers.set(container, newHandler);
            container.on('pointerdown', newHandler);
            container.on('touchstart', newHandler);
          }
        });
      } else {
        container.setInteractive(new Phaser.Geom.Rectangle(-60, -60, 120, 120), Phaser.Geom.Rectangle.Contains);
        const newHandler = () => this.onAnimalTap(container, animal);
        this.animalTapHandlers.set(container, newHandler);
        container.on('pointerdown', newHandler);
        container.on('touchstart', newHandler);
      }
    }
  }

  private speakAnimal(animal: typeof ANIMALS[0]): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.speechUtterance = new SpeechSynthesisUtterance(`${animal.name} says ${animal.sound}`);
      this.speechUtterance.rate = 0.7;
      this.speechUtterance.pitch = 1.3;
      this.speechUtterance.lang = 'en-US';
      speechSynthesis.speak(this.speechUtterance);
    }
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    this.starsEarned = 3;
    
    soundManager.playSuccess();
    haptics.success();
    
    if (!accessibility.shouldReduceMotion()) {
      this.celebration.starBurst(width / 2, height / 2);
      this.celebration.flash(0xffff00, 300);
    }
    this.celebration.floatingText(width / 2, height / 2 - 100, 'Amazing!', '#ffd700', '40px');
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 60, '⭐⭐⭐', { fontSize: '60px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'Great job! You know all the animals!', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      updateGameProgress('animals', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
    
    accessibility.announce('Congratulations! You know all the animals!');
  }
 
  shutdown(): void {
    // Cancel speech synthesis
    if (this.speechUtterance) {
      speechSynthesis.cancel();
      this.speechUtterance = null;
    }
    
    // Remove all animal tap handlers
    this.animalTapHandlers.forEach((handler, container) => {
      if (container && container.active) {
        container.off('pointerdown', handler);
        container.off('touchstart', handler);
      }
    });
    this.animalTapHandlers.clear();
    
    // Destroy all cards
    this.animalCards.forEach(c => c.destroy());
    this.animalCards = [];
    
    // Cleanup
    this.celebration?.cleanup();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}