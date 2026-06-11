import { Scene, GameObjects } from 'phaser';
import { GAME_CONFIGS, getProgress } from '../utils/GameData';

export class MainMenuScene extends Scene {
  private gameCards: GameObjects.Container[] = [];

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
    const rows = 2;
    const cardWidth = Math.min(220, (width - 80) / cols);
    const cardHeight = 180;
    const startX = (width - (cardWidth * cols + 20 * (cols - 1))) / 2;
    const startY = 160;

    GAME_CONFIGS.forEach((config, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + 20) + cardWidth / 2;
      const y = startY + row * (cardHeight + 20) + cardHeight / 2;

      const card = this.createGameCard(config, progress[config.key], x, y, cardWidth, cardHeight);
      this.gameCards.push(card);
    });
  }

  private createGameCard(
    config: { id: string; key: keyof import('../utils/GameData').GameProgress; title: string; icon: string; scene: string },
    progress: { stars: number; completed: boolean },
    x: number,
    y: number,
    width: number,
    height: number
  ): GameObjects.Container {
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

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xffffff, 0.25);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
      container.setScale(1.02);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xffffff, 0.15);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 16);
      bg.lineStyle(2, 0xffffff, 0.3);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 16);
      container.setScale(1);
    });

    container.on('pointerdown', () => {
      container.setScale(0.98);
    });

    container.on('pointerup', () => {
      container.setScale(1.02);
      this.startGame(config);
    });

    // Touch support
    container.on('touchstart', () => {
      container.setScale(0.98);
    });
    container.on('touchend', () => {
      container.setScale(1.02);
      this.startGame(config);
    });

    return container;
  }

  private startGame(config: { scene: string }): void {
    this.scene.start(config.scene);
  }

  private setupResizeHandler(): void {
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
      this.refreshLayout();
    });
  }

  private refreshLayout(): void {
    this.gameCards.forEach(card => card.destroy());
    this.gameCards = [];
    this.createGameGrid();
  }
}