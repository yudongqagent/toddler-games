import { Scene } from 'phaser';

export class BootScene extends Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBarBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BootScene', active: false });
  }

  preload(): void {
    this.createLoadingUI();
    
    this.load.on('progress', (value: number) => {
      const percent = Math.round(value * 100);
      this.progressText.setText(`${percent}%`);
      this.updateProgressBar(value);
    });

    this.load.on('complete', () => {
      this.startMainMenu();
    });

    this.loadAssets();
    
    // If no assets to load, 'complete' may not fire - start immediately
    // Check multiple conditions for robustness
    this.time.delayedCall(0, () => {
      const load = this.load;
      const hasQueue = load.list?.size > 0 || load.totalToLoad > 0;
      if (!hasQueue || !load.isLoading) {
        this.startMainMenu();
      }
    });
    
    // Also start immediately if loader is already done (synchronous)
    if (this.load.list?.size === 0 && this.load.totalToLoad === 0) {
      this.startMainMenu();
    }
  }

  private startMainMenu(): void {
    this.loadingText.setText('Ready!');
    this.progressText.setText('100%');
    this.updateProgressBar(1);
    
    this.time.delayedCall(300, () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createLoadingUI(): void {
    const { width, height } = this.scale;
    
    this.loadingText = this.add.text(width / 2, height / 2 - 60, 'Loading Toddler Games...', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.progressText = this.add.text(width / 2, height / 2 + 10, '0%', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0xffffff, 0.2);
    this.progressBarBg.fillRoundedRect(width / 2 - 150, height / 2 + 80, 300, 12, 6);

    this.progressBar = this.add.graphics();
  }

  private updateProgressBar(value: number): void {
    const { width, height } = this.scale;
    this.progressBar.clear();
    this.progressBar.fillStyle(0xffffff, 1);
    this.progressBar.fillRoundedRect(width / 2 - 148, height / 2 + 82, 296 * value, 8, 4);
  }

  private loadAssets(): void {
    // Load common assets here if needed
    // For now, we'll create graphics programmatically in each scene
  }

  static hideLoadingOverlay(): void {
    const overlay = document.getElementById('loading-overlay');
    const prompt = document.getElementById('start-prompt');
    if (overlay) overlay.classList.add('hidden');
    if (prompt) prompt.classList.add('visible');
  }
}