import 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CountingScene } from './scenes/CountingScene';
import { ColorMatchScene } from './scenes/ColorMatchScene';
import { ShapeSorterScene } from './scenes/ShapeSorterScene';
import { AnimalSoundsScene } from './scenes/AnimalSoundsScene';
import { BalloonPopScene } from './scenes/BalloonPopScene';
import { MemoryMatchScene } from './scenes/MemoryMatchScene';

interface GameConfig extends Phaser.Types.Core.GameConfig {
  parent: string;
}

let game: Phaser.Game | null = null;
let gameStarted = false;

const gameConfig: GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#667eea',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 320, height: 240 },
    max: { width: 1200, height: 900 }
  },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, MainMenuScene, CountingScene, ColorMatchScene, ShapeSorterScene, AnimalSoundsScene, BalloonPopScene, MemoryMatchScene],
  audio: { disableWebAudio: false },
  render: { pixelArt: false, antialias: true }
};

function createGame(): void {
  if (gameStarted) return;
  gameStarted = true;
  
  // Hide loading overlay, show game
  BootScene.hideLoadingOverlay();
  
  game = new Phaser.Game(gameConfig);
  
  // Unlock audio on first user interaction
  game.events.once('ready', () => {
    const soundManager = game?.sound as Phaser.Sound.WebAudioSoundManager;
    const audioContext = soundManager.context;
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  });
}

function userStart(): void {
  if (gameStarted) return;
  
  const prompt = document.getElementById('start-prompt');
  if (prompt) {
    prompt.style.display = 'none';
  }
  
  createGame();
}

// Defer Phaser Game creation until user gesture
// This is CRITICAL for automated browsers (CDP) where auto-play policies block audio/game init
const startEvents = ['pointerdown', 'touchend', 'keydown'];
startEvents.forEach(event => {
  document.addEventListener(event, userStart, { once: true, passive: true });
});

// Also handle the start button click explicitly
const startPrompt = document.getElementById('start-prompt');
if (startPrompt) {
  startPrompt.addEventListener('click', userStart);
  startPrompt.addEventListener('touchend', (e) => {
    e.preventDefault();
    userStart();
  }, { passive: false });
}

// Prevent zoom on double tap (mobile)
document.addEventListener('touchstart', (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e: TouchEvent) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

export { game, createGame, userStart };