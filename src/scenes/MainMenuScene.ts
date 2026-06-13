import { Scene, GameObjects } from 'phaser';
import { GAME_CONFIGS, getProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { accessibility } from '../utils/Accessibility';

interface GameCardHandlers {
  scaleUp: () => void;
  scaleDown: () => void;
  pressDown: () => void;
  pointerUp: () => void;
  touchEnd: () => void;
}

export class MainMenuScene extends Scene {
  private gameCards: { container: GameObjects.Container; handlers: GameCardHandlers }[] = [];
  private resizeHandler?: (gameSize: Phaser.Structs.Size) => void;

  constructor() {
    super({ key: 'MainMenuScene', active: false });
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createGameGrid();
    this.setupResizeHandler();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
    graphics.fillRect(0, 0, width, height);
  }

  private createTitle(): void {
    const { width } = this.scale;
    this.add.text(width / 2, 60, 'Toddler Games', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 105, 'Tap a game to play!', {
      fontSize: '18px',
      color: 'rgba(255,255,255,0.9)',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  private createGameGrid(): void {
    const { width, height } = this.scale;
    const progress = getProgress();
    const cols = 3;
    const cardWidth = Math.min(220, (width - 80) / cols);
    const cardHeight = 180;
    const startX = (width - (cardWidth * cols + 20 * (cols - 1))) / 2;
    const startY = 160;

    GAME_CONFIGS.forEach((config, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + 20) + cardWidth / 2;
      const y = startY + row * (cardHeight + 20) + cardHeight / 2;

      const cardData = this.createGameCard(config, progress[config.key], x, y, cardWidth, cardHeight);
      this.gameCards.push(cardData);
    });
  }

  private createGameCard(
    config: { id: string; key: keyof import('../utils/GameData').GameProgress; title: string; icon: string; scene: string },
    progress: { stars: number; completed: boolean },
    x: number,
    y: number,
    width: number,
    height: number
  ): { container: GameObjects.Container; handlers: GameCardHandlers } {
    const container = this.add.container(x, y);
    container.setSize(width, height);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
    container.add(bg);

    // Game icon
    const icon = this.add.text(0, -45, config.icon, { fontSize: '48px' }).setOrigin(0.5);
    container.add(icon);

    // Game title
    const title = this.add.text(0, 20, config.title, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    container.add(title);

    // Stars
    const starsContainer = this.add.container(0, 55);
    for (let i = 0; i < 3; i++) {
      const star = this.add.text(i * 22 - 22, 0, i < progress.stars ? '⭐' : '☆', { fontSize: '20px' }).setOrigin(0.5);
      starsContainer.add(star);
    }
    container.add(starsContainer);

    // Completed badge
    if (progress.completed) {
      const badge = this.add.text(0, 80, '✓ Completed', {
        fontSize: '12px',
        color: '#4ade80',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5);
      container.add(badge);
    }

    // Interaction
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    const scaleUp = () => {
      if (accessibility.shouldReduceMotion()) return;
      bg.clear();
      bg.fillStyle(0xffffff, 0.25);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
      this.tweens.add({
        targets: container,
        scale: 1.02,
        duration: accessibility.getDuration(100),
        ease: 'Power2.easeOut'
      });
    };

    const scaleDown = () => {
      if (accessibility.shouldReduceMotion()) return;
      bg.clear();
      bg.fillStyle(0xffffff, 0.15);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
      bg.lineStyle(2, 0xffffff, 0.3);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: accessibility.getDuration(100),
        ease: 'Power2.easeOut'
      });
    };

    const pressDown = () => {
      haptics.selection();
      soundManager.playClick();
      if (accessibility.shouldReduceMotion()) return;
      this.tweens.add({
        targets: container,
        scale: 0.96,
        duration: accessibility.getDuration(50),
        ease: 'Power2.easeOut'
      });
    };

    const pressUp = () => {
      if (accessibility.shouldReduceMotion()) return;
      this.tweens.add({
        targets: container,
        scale: 1.02,
        duration: accessibility.getDuration(100),
        ease: 'Back.easeOut',
        onComplete: () => this.startGame(config)
      });
    };

    // touchend handler - no e.event needed, just call pressUp
    const touchEnd = () => {
      pressUp();
    };

    container.on('pointerover', scaleUp);
    container.on('pointerout', scaleDown);
    container.on('pointerdown', pressDown);
    container.on('pointerup', pressUp);
    container.on('touchstart', pressDown);
    container.on('touchend', touchEnd);

    return {
      container,
      handlers: { scaleUp, scaleDown, pressDown, pointerUp: pressUp, touchEnd }
    };
  }

  private startGame(config: { scene: string }): void {
    soundManager.playClick();
    haptics.light();
    this.scene.start(config.scene);
  }

  private setupResizeHandler(): void {
    this.resizeHandler = (gameSize: Phaser.Structs.Size) => {
      this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
      this.refreshLayout();
    };
    this.scale.on('resize', this.resizeHandler);
  }

  private refreshLayout(): void {
    this.gameCards.forEach(card => card.container.destroy());
    this.gameCards = [];
    this.createGameGrid();
  }

  shutdown(): void {
    // Remove resize handler
    if (this.resizeHandler) {
      this.scale.off('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }

    // Remove all event listeners from game cards
    this.gameCards.forEach(card => {
      const { container, handlers } = card;
      if (container && container.active) {
        container.off('pointerover', handlers.scaleUp);
        container.off('pointerout', handlers.scaleDown);
        container.off('pointerdown', handlers.pressDown);
        container.off('pointerup', handlers.pointerUp);
        container.off('touchstart', handlers.pressDown);
        container.off('touchend', handlers.touchEnd);
      }
    });
    this.gameCards = [];

    // Kill all tweens
    this.tweens.killAll();
  }
}