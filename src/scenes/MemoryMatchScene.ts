import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { Celebration } from '../utils/Celebration';
import { accessibility } from '../utils/Accessibility';

const CARD_EMOJIS = ['🍎','🍌','🍇','🍓','🥕','🥦','🚌','🚗','🚲','🛴','🏠','🌲','🌸','🐸','🐰','🦋'];

interface Card {
  container: GameObjects.Container;
  emoji: string;
  revealed: boolean;
  matched: boolean;
}

export class MemoryMatchScene extends Scene {
  private cards: Card[] = [];
  private firstCard: Card | null = null;
  private secondCard: Card | null = null;
  private score: number = 0;
  private moves: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;
  private canFlip: boolean = true;
  private celebration!: Celebration;
  private cardTapHandlers: Map<GameObjects.Container, () => void> = new Map();

  constructor() {
    super({ key: 'MemoryMatchScene', active: false });
  }

  create(): void {
    this.celebration = new Celebration(this);
    this.createBackground();
    this.createBackButton();
    this.createScoreDisplay();
    this.createFeedback();
    this.setupBoard();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xe0c3fc, 0xe0c3fc, 0x8ec5fc, 0x8ec5fc, 1);
    graphics.fillRect(0, 0, width, height);
  }

  private createBackButton(): void {
    const btn = this.add.text(40, 40, '← Back', {
      fontSize: '24px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)',
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
    this.scoreText = this.add.text(width / 2, 40, 'Matches: 0/8  Moves: 0', {
      fontSize: '26px', color: '#333', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 16, y: 8 }
    }).setOrigin(0.5);
  }

  private createFeedback(): void {
    const { width, height } = this.scale;
    this.feedbackText = this.add.text(width / 2, height - 80, '', {
      fontSize: '24px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);
  }

  private setupBoard(): void {
    const { width, height } = this.scale;
    const cols = 4;
    const rows = 4;
    const pairs = 8;
    
    // Select 8 random emojis, duplicate for pairs
    const selected = [...CARD_EMOJIS].sort(() => Math.random() - 0.5).slice(0, pairs);
    const board = [...selected, ...selected].sort(() => Math.random() - 0.5);

    const cardSize = 80;
    const gap = 14;
    const boardWidth = cols * cardSize + (cols - 1) * gap;
    const boardHeight = rows * cardSize + (rows - 1) * gap;
    const startX = (width - boardWidth) / 2 + cardSize / 2;
    const startY = (height - boardHeight) / 2 + cardSize / 2 + 20;

    board.forEach((emoji, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardSize + gap);
      const y = startY + row * (cardSize + gap);

      const container = this.add.container(x, y);
      
      // Card back
      const back = this.add.graphics();
      back.fillStyle(0x7c3aed, 1);
      back.fillRoundedRect(-cardSize/2, -cardSize/2, cardSize, cardSize, 12);
      back.lineStyle(3, 0x5b21b6, 1);
      back.strokeRoundedRect(-cardSize/2, -cardSize/2, cardSize, cardSize, 12);
      
      // Pattern on back
      const pattern = this.add.graphics();
      pattern.lineStyle(1, 0xffffff, 0.2);
      for (let i = -cardSize/2 + 10; i < cardSize/2; i += 15) {
        pattern.beginPath();
        pattern.moveTo(-cardSize/2, i);
        pattern.lineTo(cardSize/2, i);
        pattern.strokePath();
      }
      
      // Card front (hidden initially)
      const front = this.add.graphics();
      front.fillStyle(0xffffff, 1);
      front.fillRoundedRect(-cardSize/2, -cardSize/2, cardSize, cardSize, 12);
      front.lineStyle(2, 0xddd, 1);
      front.strokeRoundedRect(-cardSize/2, -cardSize/2, cardSize, cardSize, 12);
      front.setVisible(false);
      
      const emojiText = this.add.text(0, 0, emoji, { fontSize: '36px' }).setOrigin(0.5).setVisible(false);
      
      container.add([back, pattern, front, emojiText]);
      container.setSize(cardSize, cardSize);
      container.setInteractive(new Phaser.Geom.Rectangle(-cardSize/2, -cardSize/2, cardSize, cardSize), Phaser.Geom.Rectangle.Contains);
      
      const card: Card = {
        container,
        emoji,
        revealed: false,
        matched: false
      };
      
      container.setData('cardData', card);
      
      const handler = () => this.onCardTap(card);
      this.cardTapHandlers.set(container, handler);
      
      container.on('pointerdown', handler);
      container.on('touchstart', handler);
      
      this.cards.push(card);
    });
  }

  private onCardTap(card: Card): void {
    if (!this.canFlip || card.revealed || card.matched || this.secondCard) return;
    
    this.revealCard(card);
    
    if (!this.firstCard) {
      this.firstCard = card;
    } else if (this.firstCard !== card) {
      this.secondCard = card;
      this.moves++;
      this.scoreText.setText(`Matches: ${this.score}/8  Moves: ${this.moves}`);
      this.canFlip = false;
      this.time.delayedCall(800, () => this.checkMatch());
    }
  }

  private revealCard(card: Card): void {
    const container = card.container;
    const back = container.getAt(0) as GameObjects.Graphics;
    const pattern = container.getAt(1) as GameObjects.Graphics;
    const front = container.getAt(2) as GameObjects.Graphics;
    const emoji = container.getAt(3) as GameObjects.Text;
    
    this.tweens.add({
      targets: [back, pattern],
      scaleX: 0,
      duration: 150,
      ease: 'Power2.easeIn',
      onComplete: () => {
        front.setVisible(true);
        emoji.setVisible(true);
        this.tweens.add({
          targets: [front, emoji],
          scaleX: { from: 0, to: 1 },
          duration: 150,
          ease: 'Power2.easeOut'
        });
      }
    });
    card.revealed = true;
  }

  private hideCard(card: Card): void {
    const container = card.container;
    const back = container.getAt(0) as GameObjects.Graphics;
    const pattern = container.getAt(1) as GameObjects.Graphics;
    const front = container.getAt(2) as GameObjects.Graphics;
    const emoji = container.getAt(3) as GameObjects.Text;
    
    this.tweens.add({
      targets: [front, emoji],
      scaleX: 0,
      duration: 150,
      ease: 'Power2.easeIn',
      onComplete: () => {
        front.setVisible(false);
        emoji.setVisible(false);
        this.tweens.add({
          targets: [back, pattern],
          scaleX: { from: 0, to: 1 },
          duration: 150,
          ease: 'Power2.easeOut'
        });
      }
    });
    card.revealed = false;
  }

  private checkMatch(): void {
    if (!this.firstCard || !this.secondCard) {
      this.canFlip = true;
      return;
    }

    if (this.firstCard.emoji === this.secondCard.emoji) {
      // Match!
      this.firstCard.matched = true;
      this.secondCard.matched = true;
      this.score++;
      this.scoreText.setText(`Matches: ${this.score}/8  Moves: ${this.moves}`);
      
      soundManager.playMatch();
      haptics.medium();
      this.feedbackText.setText('Match! 🎉').setColor('#4ade80').setVisible(true);
      this.celebration.floatingText(this.firstCard.container.x, this.firstCard.container.y - 60, 'Match!', '#4ade80', '32px');
      if (!accessibility.shouldReduceMotion()) {
        this.celebration.burst({ x: this.firstCard.container.x, y: this.firstCard.container.y, count: 10 });
      }
      
      // Celebration animation
      [this.firstCard, this.secondCard].forEach(card => {
        this.tweens.add({
          targets: card.container,
          scale: { from: 1, to: 1.2 },
          duration: 200,
          yoyo: true,
          ease: 'Back.easeOut'
        });
        const check = this.add.text(0, 0, '✓', { fontSize: '36px', color: '#4ade80' }).setOrigin(0.5);
        card.container.add(check);
        
        // Remove tap handlers for matched cards
        const handler = this.cardTapHandlers.get(card.container);
        if (handler) {
          card.container.off('pointerdown', handler);
          card.container.off('touchstart', handler);
          this.cardTapHandlers.delete(card.container);
        }
        card.container.disableInteractive();
      });
      
      if (this.score >= 8) {
        this.time.delayedCall(1000, () => this.showCompletion());
      } else {
        this.time.delayedCall(800, () => {
          if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false);
          this.resetTurn();
        });
      }
    } else {
      // No match
      soundManager.playError();
      haptics.error();
      this.feedbackText.setText('No match, try again').setColor('#ff6b6b').setVisible(true);
      this.hideCard(this.firstCard);
      this.hideCard(this.secondCard);
      this.time.delayedCall(800, () => {
        if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false);
        this.resetTurn();
      });
    }
  }

  private resetTurn(): void {
    this.firstCard = null;
    this.secondCard = null;
    this.canFlip = true;
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    this.starsEarned = this.moves <= 14 ? 3 : this.moves <= 18 ? 2 : 1;
    
    soundManager.playSuccess();
    haptics.success();
    
    if (!accessibility.shouldReduceMotion()) {
      this.celebration.starBurst(width / 2, height / 2);
      this.celebration.flash(0xffff00, 300);
    }
    this.celebration.floatingText(width / 2, height / 2 - 100, 'Amazing!', '#ffd700', '40px');
    
    const starsText = Array(this.starsEarned + 1).join('⭐');
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 60, starsText, { fontSize: '60px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, `Completed in ${this.moves} moves!`, {
      fontSize: '28px', color: '#fff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
      fontSize: '24px', color: '#fff', backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      updateGameProgress('memory', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
    
    accessibility.announce(`Congratulations! You completed the memory game in ${this.moves} moves!`);
  }
 
  shutdown(): void {
    // Remove all card tap handlers
    this.cardTapHandlers.forEach((handler, container) => {
      if (container && container.active) {
        container.off('pointerdown', handler);
        container.off('touchstart', handler);
      }
    });
    this.cardTapHandlers.clear();
    
    // Destroy all cards
    this.cards.forEach(card => card.container.destroy());
    this.cards = [];
    
    // Cleanup
    this.celebration?.cleanup();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}