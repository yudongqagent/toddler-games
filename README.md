# 🐾 Sudoku Fun 🔢

A sudoku game for kids ages 3–6 (and up). Two styles:

- **🐾 Animals** — picture sudoku with emoji themes (animals, fruits,
  vehicles…): Tiny 🐣 and Small 🐥 (4×4), Big 🐯 and Giant 🦁 (6×6)
- **🔢 Numbers** — classic sudoku with colorful digits: Starter (4×4),
  Junior (6×6), Master and Champion (9×9)

**Play it:** https://yudongqagent.github.io/toddler-games/

## Features

- Every puzzle is randomly generated and guaranteed solvable by pure logic —
  no guessing. Cells are removed only while the grid stays solvable with naked
  singles (a cell with one option) and hidden singles (a value with one home in
  a row/column/box), which also guarantees a unique solution
- Two ways to play, both supported: pick a symbol then stamp cells, or
  pick an empty cell then choose its symbol
- Bold grid lines between boxes make the box rule visible at every size
- Gentle feedback: clashing answers stay on the board with the conflicting
  cells glowing red so kids can see *why*; tap a red symbol to pop it out
- 💡 hints run a real deductive engine that walks the logic chain, never the
  answer key. It finds the next *forced* step and explains it:
  - naked single — "The glowing square can only be 6 — its row already has
    1, 4 and its box has 3, 5, so no other number fits!"
  - hidden single — "A 2 can only go in the glowing square — every other empty
    spot in this column already has a 2 close by!"
  It glows the exact proof cells, selects the target, and pulses the right
  symbol — the child still makes the move. For a wrong number it explains why:
  a visible duplicate ("there's already an 8 in this row"), or it proves what
  the square must really be ("take the 3 out — this square is really 8!"). If a
  square genuinely isn't forced yet, it says so honestly and points to one that
  is, teaching "don't guess — do the certain squares first"
- 🧽 eraser tool for taking back placed symbols (clues are protected); when
  active, the cells you can rub out light up pink
- Always-visible ⚙️ settings (sound, plus vibration where the device
  actually supports it — hidden on iOS, which has no Vibration API), a
  deep-linkable URL that points at the exact level (e.g. `#classic-2`), and
  automatic save/resume — close the tab mid-puzzle and reopen where you left off
- Tap any filled cell to light up its twins; tray badges count how many
  of each symbol are still missing
- Big celebration on a win: rotating sunburst rays, confetti rain plus
  party-popper cannons, a bouncing mascot, a glowing trophy, and stars that
  pop in one by one with an ascending chime. Stars saved per level
- Professional SVG icon set and an expressive SVG mascot — emoji appear
  only as game pieces; marimba-style WebAudio sounds with a streak that
  climbs a semitone per correct answer
- Fits iPhone and iPad, works offline once loaded, no ads, no tracking

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies,
no build step. Sounds are synthesized with WebAudio. Deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

Run locally: open `index.html` in a browser, or `python3 -m http.server`.
