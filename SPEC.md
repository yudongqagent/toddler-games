# Toddler Games - Phaser 3 + TypeScript + Vite

## Project Setup
- **Directory**: ~/projects/toddler-games
- **Framework**: Phaser 3.80 + TypeScript + Vite
- **Target**: GitHub Pages at https://yudongqagent.github.io/toddler-games/
- **GitHub Repo**: yudongqagent/toddler-games (exists, gh CLI authenticated)

## Games (6 scenes)
1. **CountingScene** - tap numbers 1-10, hear count
2. **ColorMatchScene** - match colored circles
3. **ShapeSorterScene** - drag shapes into matching holes
4. **AnimalSoundsScene** - tap animals, hear sounds (Web Speech API)
5. **BalloonPopScene** - pop balloons, counter
6. **MemoryMatchScene** - 4x4 card matching

## Architecture
- **BootScene** - loading screen with progress bar, hides overlay on start
- **MainMenuScene** - 6 game cards in responsive grid, progress from localStorage
- **main.ts** - DEFERRED Game creation on user gesture (pointerdown/touchend/keydown) — CRITICAL for CDP automation
- **GameData.ts** - interfaces for game progress

## Deployment
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Build on push to main → deploy dist/ to GitHub Pages
- Pages source: GitHub Actions (not gh-pages branch)