import { Scene, GameObjects } from 'phaser';
import { updateGameProgress } from '../utils/GameData';
import { soundManager } from '../utils/SoundManager';
import { haptics } from '../utils/Haptics';
import { Celebration } from '../utils/Celebration';
import { accessibility } from '../utils/Accessibility';

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

enum DragState {
  IDLE,
  DRAGGING,
  SNAPPING
}

export class ShapeSorterScene extends Scene {
  private holes: GameObjects.Container[] = [];
  private shapes: GameObjects.Container[] = [];
  private score: number = 0;
  private scoreText!: GameObjects.Text;
  private feedbackText!: GameObjects.Text;
  private starsEarned: number = 0;
  private celebration!: Celebration;
  private originalPositions: Map<GameObjects.Container, { x: number; y: number }> = new Map();
  private holeGlowTweens: Phaser.Tweens.Tween[] = [];
  private dragState: DragState = DragState.IDLE;

  constructor() {
    super({ key: 'ShapeSorterScene', active: false });
  }

  create(): void {
    this.celebration = new Celebration(this);
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
    btn.on('pointerup', () => {
      soundManager.playClick();
      haptics.light();
      this.scene.start('MainMenuScene');
    });
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
      
      // Glow effect for empty hole
      if (!accessibility.shouldReduceMotion()) {
        const tween = this.tweens.add({
          targets: bg,
          alpha: { from: 0.3, to: 0.6 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        this.holeGlowTweens.push(tween);
      }
      
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
      
      this.originalPositions.set(container, { x, y: shapeY });
      
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
      
      // Store handlers for cleanup
      const dragStartHandler = this.onDragStart.bind(this, container);
      const dragHandler = this.onDrag.bind(this, container);
      const dragEndHandler = this.onDragEnd.bind(this, container);
      
      container.on('dragstart', dragStartHandler);
      container.on('drag', dragHandler);
      container.on('dragend', dragEndHandler);
      
      container.setData('dragStartHandler', dragStartHandler);
      container.setData('dragHandler', dragHandler);
      container.setData('dragEndHandler', dragEndHandler);
      
      this.shapes.push(container);
    });
  }

  private onDragStart(container: GameObjects.Container): void {
    this.dragState = DragState.DRAGGING;
    soundManager.playClick();
    haptics.selection();
    if (!accessibility.shouldReduceMotion()) {
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: accessibility.getDuration(100),
        ease: 'Back.easeOut'
      });
    }
    container.setDepth(10);
  }

  private onDrag(container: GameObjects.Container, pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    container.x = dragX;
    container.y = dragY;
  }

  private onDragEnd(container: GameObjects.Container): void {
    if (this.dragState === DragState.SNAPPING) return;
    
    if (!accessibility.shouldReduceMotion()) {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: accessibility.getDuration(100),
        ease: 'Back.easeOut'
      });
    }
    container.setDepth(0);
    
    const shapeName = container.getData('shapeName') as string;
    
    // Check if dropped on correct hole
    let matched = false;
    for (const hole of this.holes) {
      const holeName = hole.getData('shapeName') as string;
      if (holeName === shapeName && Phaser.Geom.Intersects.RectangleToRectangle(
        container.getBounds(), hole.getBounds()
      )) {
        matched = true;
        this.onCorrectMatch(container, hole);
        break;
      }
    }
    
    if (!matched) {
      // Snap back to original position
      const orig = this.originalPositions.get(container) || { x: container.x, y: container.y };
      soundManager.playError();
      haptics.error();
      this.celebration.floatingText(container.x, container.y - 60, 'Try again', '#ff6b6b', '28px');
      
      if (!accessibility.shouldReduceMotion()) {
        this.tweens.add({
          targets: container,
          x: orig.x,
          y: orig.y,
          duration: accessibility.getDuration(300),
          ease: 'Back.easeOut'
        });
      } else {
        container.x = orig.x;
        container.y = orig.y;
      }
      this.feedbackText.setText('Try again!').setColor('#ff6b6b').setVisible(true);
      this.time.delayedCall(1000, () => { if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false); });
    }
  }

  private onCorrectMatch(shape: GameObjects.Container, hole: GameObjects.Container): void {
    this.dragState = DragState.SNAPPING;
    shape.disableInteractive();
    this.input.setDraggable(shape, false);
    
    // Remove drag handlers
    const dragStartHandler = shape.getData('dragStartHandler');
    const dragHandler = shape.getData('dragHandler');
    const dragEndHandler = shape.getData('dragEndHandler');
    if (dragStartHandler) shape.off('dragstart', dragStartHandler);
    if (dragHandler) shape.off('drag', dragHandler);
    if (dragEndHandler) shape.off('dragend', dragEndHandler);
    
    // Success effects
    soundManager.playMatch();
    haptics.medium();
    this.celebration.floatingText(shape.x, shape.y - 60, 'Perfect!', '#4ade80', '32px');
    this.celebration.burst({ x: hole.x, y: hole.y, count: 12 });
    
    // Snap to hole
    if (!accessibility.shouldReduceMotion()) {
      this.tweens.add({
        targets: shape,
        x: hole.x,
        y: hole.y,
        scale: { from: 1, to: 1.1 },
        duration: accessibility.getDuration(300),
        ease: 'Back.easeOut',
        onComplete: () => this.onMatchComplete(shape, hole)
      });
    } else {
      shape.x = hole.x;
      shape.y = hole.y;
      this.onMatchComplete(shape, hole);
    }
  }

  private onMatchComplete(shape: GameObjects.Container, hole: GameObjects.Container): void {
    // Celebrate
    this.score++;
    this.scoreText.setText(`Sort shapes: ${this.score}/4`);
    this.feedbackText.setText('Perfect fit! 🎉').setColor('#4ade80').setVisible(true);
    
    // Checkmark
    const check = this.add.text(0, 0, '✓', { fontSize: '48px', color: '#4ade80' }).setOrigin(0.5);
    shape.add(check);
    
    // Stop hole glow
    const holeBg = hole.getAt(0) as GameObjects.Graphics;
    this.tweens.killTweensOf(holeBg);
    holeBg.setAlpha(1);
    
    if (this.score >= 4) {
      this.time.delayedCall(1000, () => this.showCompletion());
    } else {
      this.time.delayedCall(1000, () => { if (this.feedbackText && this.feedbackText.active) this.feedbackText.setVisible(false); });
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
    this.celebration.floatingText(width / 2, height / 2 - 100, 'Perfect!', '#ffd700', '40px');
    
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
      soundManager.playClick();
      haptics.light();
      updateGameProgress('shapes', this.starsEarned);
      this.scene.start('MainMenuScene');
    });
    
    accessibility.announce('Congratulations! All shapes sorted perfectly!');
  }
 
  shutdown(): void {
    // Stop all hole glow tweens
    this.holeGlowTweens.forEach(t => { try { t.stop(); } catch {} });
    this.holeGlowTweens = [];
    
    // Remove drag handlers from shapes
    this.shapes.forEach(shape => {
      if (shape && shape.active) {
        const dragStartHandler = shape.getData('dragStartHandler');
        const dragHandler = shape.getData('dragHandler');
        const dragEndHandler = shape.getData('dragEndHandler');
        if (dragStartHandler) shape.off('dragstart', dragStartHandler);
        if (dragHandler) shape.off('drag', dragHandler);
        if (dragEndHandler) shape.off('dragend', dragEndHandler);
        this.input.setDraggable(shape, false);
      }
    });
    this.shapes = [];
    
    // Destroy holes
    this.holes.forEach(h => h.destroy());
    this.holes = [];
    
    // Cleanup
    this.originalPositions.clear();
    this.celebration?.cleanup();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}