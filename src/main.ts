import 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CountingScene } from './scenes/CountingScene';
import { ColorMatchScene } from './scenes/ColorMatchScene';
import { ShapeSorterScene } from './scenes/ShapeSorterScene';
import { AnimalSoundsScene } from './scenes/AnimalSoundsScene';
import { BalloonPopScene } from './scenes/BalloonPopScene';
import { MemoryMatchScene } from './scenes/MemoryMatchScene';
import { soundManager } from './utils/SoundManager';
import { accessibility } from './utils/Accessibility';

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

  // Unlock audio on first user interaction after game is ready
  game.events.once('ready', () => {
    // SoundManager will be initialized, but we let it handle its own audioContext
    // The soundManager.getContext() will create/resume the context when first sound plays
    soundManager.resumeIfNeeded();
  });
}

function userStart(): void {
  if (gameStarted) return;
  
  // Play click sound on start
  soundManager.playClick();

  const prompt = document.getElementById('start-prompt');
  if (prompt) {
    prompt.style.display = 'none';
  }

  createGame();
}

// Sound toggle button
function createSoundToggle(): void {
  const toggle = document.createElement('button');
  toggle.id = 'sound-toggle';
  toggle.innerHTML = '🔊';
  toggle.title = 'Toggle sound';
  toggle.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255,255,255,0.3);
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.1s;
  `;
  
  toggle.addEventListener('click', () => {
    const enabled = !soundManager.isEnabled();
    soundManager.setEnabled(enabled);
    toggle.innerHTML = enabled ? '🔊' : '🔇';
    toggle.setAttribute('aria-label', enabled ? 'Sound on' : 'Sound off');
    soundManager.playClick();
  });
  
  toggle.addEventListener('touchend', (e) => {
    e.preventDefault();
    const enabled = !soundManager.isEnabled();
    soundManager.setEnabled(enabled);
    toggle.innerHTML = enabled ? '🔊' : '🔇';
    soundManager.playClick();
  }, { passive: false });
  
  document.body.appendChild(toggle);
}

// Show start prompt immediately after DOM ready
function showStartPrompt(): void {
  const prompt = document.getElementById('start-prompt');
  if (prompt) {
    prompt.classList.add('visible');
  }
  createSoundToggle();
}

// Defer Phaser Game creation until user gesture
// This is CRITICAL for automated browsers (CDP) where auto-play policies block audio/game init
// passive: false allows preventDefault() for audio unlock
const startEvents = ['pointerdown', 'touchend', 'keydown'];
startEvents.forEach(event => {
  document.addEventListener(event, userStart, { once: true, passive: false });
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

// Show start prompt when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showStartPrompt);
} else {
  showStartPrompt();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  soundManager.dispose();
});

export { game, createGame, userStart };