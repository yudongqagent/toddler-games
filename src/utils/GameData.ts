export interface GameProgress {
  counting: { stars: number; completed: boolean };
  colors: { stars: number; completed: boolean };
  shapes: { stars: number; completed: boolean };
  animals: { stars: number; completed: boolean };
  balloons: { stars: number; completed: boolean };
  memory: { stars: number; completed: boolean };
}

export const DEFAULT_PROGRESS: GameProgress = {
  counting: { stars: 0, completed: false },
  colors: { stars: 0, completed: false },
  shapes: { stars: 0, completed: false },
  animals: { stars: 0, completed: false },
  balloons: { stars: 0, completed: false },
  memory: { stars: 0, completed: false }
};

export const GAME_CONFIGS = [
  { id: 'counting', key: 'counting', title: 'Counting 1-10', icon: '🔢', scene: 'CountingScene' },
  { id: 'colors', key: 'colors', title: 'Color Match', icon: '🎨', scene: 'ColorMatchScene' },
  { id: 'shapes', key: 'shapes', title: 'Shape Sorter', icon: '🔷', scene: 'ShapeSorterScene' },
  { id: 'animals', key: 'animals', title: 'Animal Sounds', icon: '🐄', scene: 'AnimalSoundsScene' },
  { id: 'balloons', key: 'balloons', title: 'Balloon Pop', icon: '🎈', scene: 'BalloonPopScene' },
  { id: 'memory', key: 'memory', title: 'Memory Match', icon: '🧠', scene: 'MemoryMatchScene' }
] as const;

export function getProgress(): GameProgress {
  try {
    const stored = localStorage.getItem('toddler-games-progress');
    if (stored) return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PROGRESS;
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem('toddler-games-progress', JSON.stringify(progress));
  } catch {}
}

export function updateGameProgress(gameKey: keyof GameProgress, stars: number): void {
  const progress = getProgress();
  progress[gameKey].stars = Math.max(progress[gameKey].stars, stars);
  progress[gameKey].completed = stars >= 3;
  saveProgress(progress);
}