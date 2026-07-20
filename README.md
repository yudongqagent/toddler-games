# 🐾 Sudoku Fun 🔢

A sudoku game for kids ages 3–6 (and up). Two styles:

- **🐾 Animals** — picture sudoku with emoji themes (animals, fruits,
  vehicles…): Tiny 🐣 and Small 🐥 (4×4), Big 🐯 and Giant 🦁 (6×6)
- **🔢 Numbers** — classic sudoku with colorful digits: Starter (4×4),
  Junior (6×6), Master and Champion (9×9)

**Play it:** https://yudongqagent.github.io/toddler-games/

## Features

- Every puzzle is randomly generated with a guaranteed unique solution
  (backtracking solver with minimum-remaining-values search)
- Two ways to play, both supported: pick a symbol then stamp cells, or
  pick an empty cell then choose its symbol
- Bold grid lines between boxes make the box rule visible at every size
- Gentle feedback: clashing answers stay on the board with the conflicting
  cells glowing red so kids can see *why*; tap a red symbol to pop it out
- 💡 hints teach instead of solving: a speech bubble explains the reasoning
  ("This row needs just one more!", "Only 3 fits here!"), highlights the
  proof cells, and pulses the right tray symbol — the child makes the move
- 🧽 eraser tool for taking back placed symbols (clues are protected)
- Tap any filled cell to light up its twins; tray badges count how many
  of each symbol are still missing
- Confetti + fanfare celebration, stars saved per level
- Professional SVG icon set and an expressive SVG mascot — emoji appear
  only as game pieces; marimba-style WebAudio sounds with a streak that
  climbs a semitone per correct answer
- Fits iPhone and iPad, works offline once loaded, no ads, no tracking

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies,
no build step. Sounds are synthesized with WebAudio. Deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

Run locally: open `index.html` in a browser, or `python3 -m http.server`.
