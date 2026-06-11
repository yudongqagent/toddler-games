import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';

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

  constructor() {
    super({ key: 'AnimalSoundsScene', active: false });
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
    graphics.fillGradientStyle(0xfdbb2d, 0xfdbb2d, 0x22c1c3, 0x22c1c3, 1);
    graphics.fillRect(0, 0, width, height);
  }

  private createBackButton(): void {
    const btn = this.add.text(40, 40, '← Back', {
      fontSize: '24px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { x: 16, y: 8 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerup', () => this.scene.start('MainMenuScene'));
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
      
      container.on('pointerdown', () => this.onAnimalTap(container, animal));
      container.on('touchstart', () => this.onAnimalTap(container, animal));

      this.animalCards.push(container);
    });
  }

  private onAnimalTap(container: GameObjects.Container, animal: typeof ANIMALS[0]): void {
    container.disableInteractive();
    
    if (animal.name === this.currentAnimal?.name) {
      this.score++;
      this.feedbackText.setText(`${animal.name} says ${animal.sound}! 🎉`).setColor('#4ade80').setVisible(true);
      this.speakAnimal(animal);
      
      const check = this.add.text(0, 0, '✓', { fontSize: '48px', color: '#4ade80' }).setOrigin(0.5);
      container.add(check);
      
      if (this.score >= ANIMALS.length - 2) { // Stop when most found
        this.time.delayedCall(1000, () => this.showCompletion());
      } else {
        this.time.delayedCall(1200, () => {
          this.feedbackText.setVisible(false);
          this.newRound();
        });
      }
    } else {
      this.feedbackText.setText(`That's ${animal.name} (${animal.sound})`).setColor('#ff6b6b').setVisible(true);
      this.speakAnimal(animal);
      this.tweens.add({
        targets: container, x: { from: container.x, to: container.x - 10 },
        duration: 100, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
        onComplete: () => container.setInteractive(new Phaser.Geom.Rectangle(-60, -60, 120, 120), Phaser.Geom.Rectangle.Contains)
      });
    }
  }

  private speakAnimal(animal: typeof ANIMALS[0]): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${animal.name} says ${animal.sound}`);
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      utterance.lang = 'en-US';
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    this.starsEarned = 3;
    
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
      updateGameProgress('animals', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
  }
}