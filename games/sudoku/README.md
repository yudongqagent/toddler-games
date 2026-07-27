# 🐾 Sudoku Fun 🔢

A sudoku game for kids ages 3–6 (and up). Two styles:

- **🐾 Animals** — picture sudoku with emoji themes (animals, fruits,
  vehicles…): Tiny 🐣 and Small 🐥 (4×4), Big 🐯 and Giant 🦁 (6×6)
- **🔢 Numbers** — classic sudoku with colorful digits: Starter (4×4),
  Junior (6×6), Master and Champion (9×9)

**Play it:** https://yudongqagent.github.io/toddler-games/

## Features

- Every puzzle is randomly generated and guaranteed solvable by pure logic —
  no guessing. Most levels stay singles-only (naked/hidden singles) for young
  kids. The secret **Legend** level generates genuinely hard 9×9s (≈95% need
  advanced techniques) accepted only if the deductive engine can crack them, so
  a full explanation always exists
- Two ways to play, both supported: pick a symbol then stamp cells, or
  pick an empty cell then choose its symbol
- Bold grid lines between boxes make the box rule visible at every size
- Gentle feedback: clashing answers stay on the board with the conflicting
  cells glowing red so kids can see *why*; tap a red symbol to pop it out
- 💡 hints are user-paced guided walkthroughs (Next ▸ / Got it ✓ / ✕ — nothing
  auto-advances) produced by a real deductive engine, never the answer key.
  Every step uses one consistent visual language: the row/column/box under
  discussion is **banded blue**, evidence cells glow **green**, **arrows** show
  who blocks whom, a **crossed-out digit** means "can't go here", the answer
  square turns **gold**, and everything else dims so the eye follows the logic
- On hard boards with no obvious move, the walkthrough steps through each
  advanced elimination (pointing/claiming, naked & hidden pairs/triples,
  X-Wing, XY-Wing) until the move is forced. Wrong numbers get the same
  treatment: a visible duplicate is shown with an arrow ("this row already has
  a 5"), or the square's true value is derived step by step ("so this square
  is really 2 — the 9 can't stay"). The engine is verified sound (never
  eliminates a true value) and complete (solves every puzzle it accepts)
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
