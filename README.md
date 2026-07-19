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
- Gentle feedback: wrong answers wiggle away, correct ones pop with a chime
- 💡 hint button, confetti + fanfare celebration, stars saved per level
- Fits iPhone and iPad, works offline once loaded, no ads, no tracking

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies,
no build step. Sounds are synthesized with WebAudio. Deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

Run locally: open `index.html` in a browser, or `python3 -m http.server`.
