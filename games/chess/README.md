# ♞ Chess

Play chess against the computer, right in the browser. One self-contained
`index.html` — no build step, no dependencies, works offline once loaded.

**Play:** https://yudongqagent.github.io/toddler-games/games/chess/

## Features

- **4 AI levels** — 🌱 Learning, 🙂 Friendly, 🧠 Sharp, ♞ Grandmaster.
  The engine is a from-scratch alpha-beta searcher (iterative deepening,
  quiescence, transposition table, null-move pruning, LMR, tapered
  piece-square eval) plus a small opening book. Grandmaster thinks ~2.5s/move
  and plays strong club-level chess.
- **Coach that teaches** — 💡 Hint shows the best move *and explains why*
  (captures, checks, development, castling…). After your moves it warns you
  when a piece is hanging, and explains every AI move in plain language.
- **Intuitive board** — tap-to-move and drag-and-drop, legal-move dots,
  last-move and check highlights, hint arrows, move list in SAN, captured
  pieces, and a live eval bar.
- **House rules kept** — one file, zero dependencies, WebAudio bleeps
  (mutable), `chess-*` namespaced localStorage, save/resume, `#fen=` deep
  links, mobile-first layout, `prefers-reduced-motion` respected.
- Win/loss/draw record feeds the home-page card badge (`chess-record`).

## Files

```
games/chess/
  index.html   the whole game (engine + UI)
  README.md    this file
```

## Engine notes

The engine section (before the `// ===== UI =====` marker) has no DOM
access and is tested under node: exact perft counts for the start position
(20/400/8902/197281) and Kiwipete (48/2039/97862), mate/stalemate scoring,
FEN round-trips, and make/unmake balance.
