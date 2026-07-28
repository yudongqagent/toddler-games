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

**Boosters explain themselves.** The shape of the match becomes the shape of
the blast, so what a booster does is guessable rather than memorised:

| You match | You get | It clears |
|---|---|---|
| four in a line | ⭐ **star** | its whole row and column |
| a corner or T | 💣 **bomb** | everything around it |
| five in a line | 🌈 **rainbow** | every fruit of one colour |

Swap two boosters together and they combine — a bomb pair makes one much
bigger blast, star + bomb makes a three-wide cross, and a rainbow turns every
fruit of a colour into the other booster and sets them all off at once.

Each one has to answer three questions at a glance — what am I, what will I
clear, and how do I go off:

- The **⭐ star** wears four arrows that pump outward, so "this blasts in four
  directions" reads without words. The **💣 bomb** simply draws the circle it
  is going to take out. Their fruit stays visible, because they can still be
  matched normally.
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

**Helper tools.** Three of them sit under the goals, and none of them cost a
move — they're a treat, not a currency, and nothing here is for sale:

- 🔨 **hammer** — tap any single fruit and pop it (set off a booster with it too)
- 🔄 **swap** — trade any two neighbours, even when it makes no match at all
- 🌀 **mix** — reshuffle the whole board

You start with a couple of each and earn more by finishing levels: one per
level, rotating so the stock stays balanced, plus a bonus one for three stars.
They cap at nine so the counters stay legible. Tapping a tool primes it, the
board pulses to show every tile is now a target, and the footnote says what to
do next.

**The rainbow hunts.** It doesn't just delete a colour. The orb swells and
flares, then fires a bolt of light at each fruit of that colour **one at a
time**, and each one pops as its bolt lands — so you watch it work through the
board. The cadence tightens for bigger sets, so eight fruit and the entire
board both take about a second. Measured: 14 targets, 14 bolts, exactly the
14 tiles the aim preview lit up before you committed.

**Nothing shakes.** A big clear used to jolt the whole board, which is
unpleasant to look at and worse on a device held close to a small face. The
board flares instead — same "that was big" beat, none of the motion.

**Boosters you'll actually see.** Measured over 300 simulated games, a 7×7 with
six fruit threw off **1.7 boosters per 30 moves** — most children would never
have met one. Two changes fixed that, both scaled to how sparse the board is
(a 5×5 with four fruit is already dense and needed no help):

- refilled fruit sometimes copies a neighbour, seeding the near-misses that
  become cascades and 4-in-a-rows;
- after a drought of boosterless moves the next match, however small, is
  quietly upgraded to a star — the child only ever sees a gift arrive.

Measured in the real game afterwards: **8.0 boosters per 30 moves**, 4.7× more.

**Leaf covers.** From level 3 a patch of leaves grows over the middle of the
board. Pop the fruit standing on a leaf and the leaf is swept away; fruit
falling past afterwards passes underneath, so a cover can only be cleared by a
match made right on top of it. The leaves are deliberately translucent — you
have to be able to read the fruit underneath to aim at it.

They're kept few and central for a reason. Leaves come off at under half the
rate fruit does, and scattered ones stranded on cold edge cells produced a
miserable tail where the last leaf took longer than the whole rest of the
level. The idle hint now prefers a swap that sweeps a leaf, which is what
actually steers you to the last stubborn one.

**Levels never run out.** One board size everywhere — the big 7×7, because
that's the one with room for chains and boosters to do something. Levels are
generated from their number rather than authored, so there's always another
one, and Level 34 is the same board every time you replay it. Beating a level
unlocks the next; the menu keeps every level you've reached, with its stars,
and a **total score that never resets**.

The curve, all on the same board:

| Level | Fruit kinds | Goals | Leaves | Moves |
|---|---|---|---|---|
| 1 | 4 | 9 of one fruit | — | 12 |
| 3 | 5 | 11 of two fruit | 4 | 14 |
| 8 | 6 | 16 of three fruit | 8 | 27 |
| 16+ | 6 | 24 of three fruit | 8 | 35 |

Both the goal size and the leaf count plateau around level 16 — a toddler game
should not get harder forever. Past that the variety comes from which fruit is
asked for and which shape the leaves make.

Plus **Free Play** — no goal, no move count, endless.

The move budget is a safety net, not the challenge: it's 1.5× the measured
number of moves the objective actually takes, so every level is finishable
without playing well, and the "+5 moves" offer still sits behind that. **Par**
is the challenge — 62% of the budget for three stars, 85% for two. Measured on
the plateau levels, a bot that just follows the pointing finger and never
touches a tool wins level 16 in 24 of 35 moves and level 20 in 25 — two stars
both times. Three stars needs real play, or a well-spent tool.

**Graphics.** Every fruit is one glossy sweet with a specular highlight and real
depth. There used to be a different geometric backdrop per fruit — circle,
hexagon, diamond — as a colour-blindness fallback, but the fruit emoji is
already a distinct silhouette *and* a distinct colour, so the polygons were a
redundant third channel that made the board look busy. Nothing here depends on
colour vision alone.

**A level arrives, it doesn't appear.** Starting one plays a card announcing it
and its goal over an empty board, then the fruit rains in along a diagonal wave
so the board assembles itself in front of you — about 2.2 seconds before you
can play, and input is held until it lands. Finishing one runs the wave in
reverse: the board sweeps itself away first, so the confetti and the stars land
on a clear stage instead of covering up a board still full of fruit.

**Every clear has three beats.** The matched fruit flare white for a moment
first — that beat is what tells you *which* ones matched — then they burst in
waves travelling out from the tile you actually moved, each leaving a halo
behind, and the burst throws more confetti the deeper the cascade runs. Falling
fruit squashes on impact and kicks up a puff of dust. Swapped fruit lift and
swell as they trade places.

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

State lives under `match3-` localStorage keys: `match3-stars` (per level),
`match3-total` (points, kept forever), `match3-max` (highest level unlocked),
`match3-tools` (helper tool stock),
`match3-sound`, `match3-vibe`, and `match3-save` for mid-level resume. Levels
are deep-linkable (`#lvl-2`, `#free`) but you can't skip past what you've
unlocked. `prefers-reduced-motion` disables the decorative animation
while keeping the booster aim ring readable.

Run locally: open `index.html`, or `python3 -m http.server` from the repo root.
