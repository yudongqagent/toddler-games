import { Scene, GameObjects, Input } from 'phaser';
import { updateGameProgress } from '../utils/GameData';

const SHAPES = [
  { name: 'Circle', draw: (g: GameObjects.Graphics, s: number) => g.fillCircle(0, 0, s) },
  { name: 'Square', draw: (g: GameObjects.Graphics, s: number) => g.fillRect(-s, -s, s*2, s*2) },
  { name: 'Triangle', draw: (g: GameObjects.Graphics, s: number) => {
    g.beginPath();
    g.moveTo(0, -s);
    g.lineTo(s, s);
    g.lineTo(-s, s);
    g.closePath();
    g.fillPath();
  }},
  { name: 'Star', draw: (g: GameObjects.Graphics, s: number) => {
    const spikes = 5;
    const outerRadius = s;
    const innerRadius = s * 0.4;
    g.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
  }}
];

export class ShapeSorterScene extends Scene {
  private holes: GameObjects.Container[] = [];
  private shapes: GameObjects.Container[] = [];
  private score: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;

  constructor() {
    super({ key: 'ShapeSorterScene', active: false });
  }

  create(): void {
    this.createBackground();
    this.createBackButton();
    this.createScoreDisplay();
    this.createFeedback();
    this.setupShapesAndHoles();
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xffecd2, 0xffecd2, 0xfcb69f, 0xfcb69f, 1);
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
    this.scoreText = this.add.text(width / 2, 40, 'Sort shapes: 0/4', {
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

  private setupShapesAndHoles(): void {
    const { width, height } = this.scale;
    const shuffledShapes = [...SHAPES].sort(() => Math.random() - 0.5);
    const shuffledHoles = [...SHAPES].sort(() => Math.random() - 0.5);

    // Create holes (top row)
    const holeY = 150;
    const holeSpacing = width / (SHAPES.length + 1);
    
    shuffledHoles.forEach((shape, i) => {
      const x = holeSpacing * (i + 1);
      const container = this.add.container(x, holeY);
      
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.3);
      shape.draw(bg, 40);
      bg.lineStyle(3, 0xaaa, 1);
      shape.draw(bg, 40);
      bg.strokePath();
      
      container.add(bg);
      container.setData('shapeName', shape.name);
      container.setSize(100, 100);
      this.holes.push(container);
    });

    // Create draggable shapes (bottom row)
    const shapeY = height - 130;
    const shapeSpacing = width / (SHAPES.length + 1);
    
    shuffledShapes.forEach((shape, i) => {
      const x = shapeSpacing * (i + 1);
      const container = this.add.container(x, shapeY);
      
      const g = this.add.graphics();
      g.fillStyle(0x7c3aed, 1);
      shape.draw(g, 40);
      g.lineStyle(3, 0x5b21b6, 1);
      shape.draw(g, 40);
      g.strokePath();
      
      container.add(g);
      container.setData('shapeName', shape.name);
      container.setSize(100, 100);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
      
      this.input.setDraggable(container);
      container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        container.x = dragX;
        container.y = dragY;
      });
      container.on('dragend', () => this.onDragEnd(container));
      
      this.shapes.push(container);
    });
  }

  private onDragEnd(shape: GameObjects.Container): void {
    const shapeName = shape.getData('shapeName') as string;
    
    // Check if dropped on correct hole
    let matched = false;
    for (const hole of this.holes) {
      const holeName = hole.getData('shapeName') as string;
      if (holeName === shapeName && Phaser.Geom.Intersects.RectangleToRectangle(
        shape.getBounds(), hole.getBounds()
      )) {
        matched = true;
        this.onCorrectMatch(shape, hole);
        break;
      }
    }
    
    if (!matched) {
      // Snap back
      this.tweens.add({
        targets: shape,
        x: (shape.getData('originalX') as number) || shape.x,
        y: (shape.getData('originalY') as number) || shape.y,
        duration: 300,
        ease: 'Back.easeOut'
      });
      this.feedbackText.setText('Try again!').setColor('#ff6b6b').setVisible(true);
      this.time.delayedCall(1000, () => this.feedbackText.setVisible(false));
    }
  }

  private onCorrectMatch(shape: GameObjects.Container, hole: GameObjects.Container): void {
    shape.disableInteractive();
    this.input.setDraggable(shape, false);
    
    // Snap to hole
    this.tweens.add({
      targets: shape,
      x: hole.x,
      y: hole.y,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Celebrate
        this.score++;
        this.scoreText.setText(`Sort shapes: ${this.score}/4`);
        this.feedbackText.setText('Perfect fit! 🎉').setColor('#4ade80').setVisible(true);
        
        // Checkmark
        const check = this.add.text(0, 0, '✓', { fontSize: '48px', color: '#4ade80' }).setOrigin(0.5);
        shape.add(check);
        
        if (this.score >= 4) {
          this.time.delayedCall(1000, () => this.showCompletion());
        } else {
          this.time.delayedCall(1000, () => this.feedbackText.setVisible(false));
        }
      }
    });
  }

  private showCompletion(): void {
    const { width, height } = this.scale;
    this.starsEarned = 3;
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 60, '⭐⭐⭐', { fontSize: '60px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'All shapes sorted perfectly!', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial, sans-serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 100, 'Back to Menu', {
      fontSize: '24px', color: '#ffffff', backgroundColor: '#7c3aed',
      padding: { x: 32, y: 16 }, fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerup', () => {
      updateGameProgress('shapes', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
  }
}