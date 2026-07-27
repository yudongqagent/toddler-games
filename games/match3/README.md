# 🍓 Fruit Pop

A match-3 for kids ages 3–6. Swap two neighbouring fruit to line up three or
more, they pop, everything above tumbles down to fill the gap, and the chain
keeps going.

**Play it:** https://yudongqagent.github.io/toddler-games/games/match3/

## Design notes

**Nobody loses.** There is no timer and no failure screen. Run out of moves and
a friendly card offers five more — take them as often as you like (it just caps
that round at one star). A swap that doesn't match costs nothing at all: the two
fruit wobble and hop back. Sit still for six seconds and the two tiles that make
a match pulse gently until you move.

**Shape, not just colour.** Every fruit has its own silhouette — strawberry
circle, banana rounded square, grapes hexagon, apple diamond, orange petal,
blueberry star — so the board is readable without relying on colour vision. The
goal chips use the same shapes at small size.

**The curve.** The board grows and the fruit variety grows together, which is
what actually makes matches scarcer:

| Level | Board | Fruit | Goal | Moves |
|---|---|---|---|---|
| Berry Patch | 5×5 | 4 | 10 🍓 | 18 |
| Fruit Basket | 6×6 | 4 | 12 🍌 + 12 🍇 | 22 |
| Orchard | 6×6 | 5 | 14 🍏 + 14 🍊 | 24 |
| Rainbow Grove | 7×7 | 6 | 14 🍓 + 14 🍇 + 14 🫐 | 30 |

Plus **Free Play** — no goal, no move count, endless.

Budgets are loose on purpose. Playing the first move you happen to spot, with no
strategy at all, finishes Berry Patch in about 9 of its 18 moves. Stars are what
reward playing well: three stars inside 75% of the budget, two inside 92%, one
for finishing however long it takes.

**Boosters.** Four in a row (or an L/T corner) leaves a ⭐ star that blasts its
whole row and column. A straight five leaves a 🌈 rainbow that removes every
fruit of whatever it's swapped onto — and two rainbows together clear the board.
Tap a booster once to select it, tap again to set it off where it stands.

**Juice.** Matches burst into particles in their own colour, collected fruit
fly across the screen into their goal chip, cascades climb a major-pentatonic
scale so a long chain plays a tune, and chains of two or more shout "Nice!",
"Wow!", "Amazing!". Boards that run out of moves reshuffle themselves rather
than dead-end.

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies, no
build step. Sound is synthesized with WebAudio (no audio files). Tiles are
absolutely-positioned divs moved with CSS transforms, so falls and swaps are
GPU-composited transitions rather than a repainting canvas.

State lives under `match3-` localStorage keys: `match3-stars`, `match3-sound`,
`match3-vibe`, and `match3-save` for mid-level resume. Levels are deep-linkable
(`#lvl-2`, `#free`). `prefers-reduced-motion` disables the decorative animation.

Run locally: open `index.html`, or `python3 -m http.server` from the repo root.
