# 🐾 Animal Sudoku

A picture sudoku game for kids ages 3–6. No numbers — just animals, fruits, and
vehicles. Tap a friend in the tray, then stamp it into the grid so every friend
appears once in each row, column, and box.

**Play it:** https://yudongqagent.github.io/toddler-games/

## Features

- 4 difficulty levels: Tiny 🐣 and Small 🐥 (4×4), Big 🐯 and Giant 🦁 (6×6)
- Every puzzle is randomly generated with a guaranteed unique solution
- Gentle feedback: wrong answers wiggle away, correct ones pop with a chime
- 💡 hint button, confetti + fanfare celebration, stars saved per level
- Fits iPhone and iPad, works offline once loaded, no ads, no tracking

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies,
no build step. Sounds are synthesized with WebAudio. Deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

Run locally: open `index.html` in a browser, or `python3 -m http.server`.
