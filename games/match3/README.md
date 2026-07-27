# 🍓 Fruit Pop

A match-3 for kids ages 3–6. Swap two neighbouring fruit to line up three or
more, they pop, everything above tumbles down to fill the gap, and the chain
keeps going.

**Play it:** https://yudongqagent.github.io/toddler-games/games/match3/

## Design notes

**Nobody loses.** There is no timer and no failure screen. Run out of moves and
a friendly card offers five more — take them as often as you like (it just caps
that round at one star). A swap that doesn't match costs nothing at all: the two
fruit wobble and hop back. Sit still for six seconds and a pointing finger
travels between the two tiles worth trading; on a brand-new save it appears
after two seconds instead, which is the entire tutorial.

**Boosters explain themselves.** A booster has to answer three questions at a
glance — what am I, what will I clear, and how do I go off:

- The **⭐ star** wears four arrows that pump outward, so "this blasts in four
  directions" reads without words. Its fruit stays visible in the middle,
  because it can still be matched normally.
- **Selecting one lights up every tile it would take** — the star's whole row
  and column, the rainbow's whole colour. You find out what it does *before*
  spending it, and the footnote switches to "Tap it again to set it off!".
- **Firing it is animated.** A bar of light sweeps the row and the column (a
  ring washes outward for the rainbow), and the fruit pop in waves travelling
  out from the centre rather than all vanishing at once. Boosters set off by
  other boosters draw their own beams, so a chain reaction reads as a chain
  reaction instead of the board erasing itself.
- Creating one pulls sparks *inward* to the new tile, so it looks assembled out
  of the fruit that just vanished.

Four in a row (or an L/T corner) leaves a star. A straight five leaves a
🌈 rainbow that removes every fruit of whatever it's swapped onto — two
rainbows together clear the board.

**Boosters you'll actually see.** Measured over 300 simulated games, a 7×7 with
six fruit threw off **1.7 boosters per 30 moves** — most children would never
have met one. Two changes fixed that, both scaled to how sparse the board is
(a 5×5 with four fruit is already dense and needed no help):

- refilled fruit sometimes copies a neighbour, seeding the near-misses that
  become cascades and 4-in-a-rows;
- after a drought of boosterless moves the next match, however small, is
  quietly upgraded to a star — the child only ever sees a gift arrive.

Measured in the real game afterwards: **8.0 boosters per 30 moves**, 4.7× more.

**Leaf covers.** Levels 3 and 5 grow a diamond of leaves over the middle of the
board. Pop the fruit standing on a leaf and the leaf is swept away; fruit
falling past afterwards passes underneath, so a cover can only be cleared by a
match made right on top of it. The leaves are deliberately translucent — you
have to be able to read the fruit underneath to aim at it.

**The curve.** Board and fruit variety grow together, and the covers arrive as a
genuinely new idea rather than more of the same board:

| Level | Board | Fruit | Goal | Moves |
|---|---|---|---|---|
| Berry Patch | 5×5 | 4 | 10 🍓 | 18 |
| Fruit Basket | 6×6 | 4 | 12 🍌 + 12 🍇 | 22 |
| Leafy Hollow | 6×6 | 4 | sweep 10 🍃 | 20 |
| Orchard | 6×6 | 5 | 14 🍏 + 14 🍊 | 24 |
| Hidden Grove | 7×7 | 5 | 12 🍓 + sweep 16 🍃 | 26 |
| Rainbow Grove | 7×7 | 6 | 16 🍓 + 16 🍇 + 16 🫐 | 30 |

Plus **Free Play** — no goal, no move count, endless.

The move budget is a safety net, not the challenge: every level is finishable
by a child swapping more or less at random (measured — Berry Patch takes about
9 of its 18 moves, Fruit Basket about 9 of 22). **Par** is the challenge, and it
sits at 62% of the budget for three stars and 85% for two, because at a looser
75% that same random play three-starred the late levels and the stars stopped
meaning anything.

**Graphics.** Every fruit is one glossy sweet with a specular highlight and real
depth. There used to be a different geometric backdrop per fruit — circle,
hexagon, diamond — as a colour-blindness fallback, but the fruit emoji is
already a distinct silhouette *and* a distinct colour, so the polygons were a
redundant third channel that made the board look busy. Nothing here depends on
colour vision alone.

**Sound.** Each fruit owns a note of the pentatonic scale, so clearing bananas
always sounds like bananas, and each cascade step lifts the whole chord — a long
chain plays a tune. Cascade cheers carry an emoji as well as a word, since the
audience can't read.

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies, no
build step. Sound is synthesized with WebAudio (no audio files). Tiles are
absolutely-positioned divs moved with CSS transforms, so falls and swaps are
GPU-composited transitions rather than a repainting canvas. Covers live in their
own layer keyed to cells, not tiles, because tiles fall and cells don't.

State lives under `match3-` localStorage keys: `match3-stars`, `match3-sound`,
`match3-vibe`, and `match3-save` for mid-level resume. Levels are deep-linkable
(`#lvl-2`, `#free`). `prefers-reduced-motion` disables the decorative animation
while keeping the booster aim ring readable.

Run locally: open `index.html`, or `python3 -m http.server` from the repo root.
