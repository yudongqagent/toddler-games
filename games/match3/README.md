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
fruit of a colour into the other booster and sets them all off at once. That
last one converts them **one at a time**, nearest first, each getting its own
bolt, so you watch the rainbow seed the whole board before any of it goes off.
Measured on a real board: 12 fruit converted, 13 bombs detonating, 45 of 49
tiles cleared.

Each one has to answer three questions at a glance — what am I, what will I
clear, and how do I go off:

- A booster looks like *charged fruit*, not fruit with UI stuck on it. The
  **⭐ star** is lit at the four edges and clear through the middle, so it reads
  as charged along both axes; the **💣 bomb** wears a halo pulsing outward.
  Both markings are light, and both sit *behind* the fruit so the fruit stays
  the identity — it can still be matched normally. (Flat white arrows and a
  white dashed circle were the first attempt; they read as debug overlay, and a
  solid glowing cross was worse because it buried the fruit.)
- **Selecting one lights up every tile it would take** — the star's whole row
  and column, the rainbow's whole colour. You find out what it does *before*
  spending it, and the footnote switches to "Tap it again to set it off!".
- **Firing it is animated.** The star throws four tapered blades of light — a
  wide underglow, a warm body and a hot white core, narrowing to a point, with
  a bloom riding each advancing tip and embers shedding off it. (A flat capsule
  of even width was what made this read as a UI divider rather than energy.) A
  ring washes outward for the rainbow, and the fruit pop in waves travelling
  out from the centre rather than all vanishing at once.
- **Chains propagate in time.** A booster set off by another booster is a
  sequence of events, not one event, so the chain is walked breadth-first and
  every link knows its depth: link 0 goes off now, link 1 a beat later, link 2
  a beat after that. Each fruit also knows which booster claimed it and at what
  depth, so the destruction rolls outward with the chain instead of the whole
  board clearing on the first frame. Measured on a three-link chain: 13 fruit
  popping, then 17, then 21, then 23.
- Creating one is a single motion, not two. The matched fruit **rush into the
  cell the booster is forming in** and shrink out as they arrive, and the
  booster is born *while they're still travelling* — measured, the fruit start
  moving at 511ms and the booster lands at 657ms, mid-flight. Clearing first
  and then spawning afterwards read as two disconnected animations with a pause
  between them. The travel rides the tile's own transform, so it uses the same
  movement path as gravity.

**Helper tools.** Three of them sit in a bar pinned to the bottom of the
screen, thumb-height, and none of them cost a move — they're a treat, not a currency, and nothing here is for sale:

- 🔨 **hammer** — tap any single fruit and pop it (set off a booster with it too)
- 🔄 **swap** — trade any two neighbours, even when it makes no match at all
- 🌀 **mix** — reshuffle the whole board

You start with a couple of each and earn more by finishing levels: one per
level, rotating so the stock stays balanced, plus a bonus one for three stars.
They cap at nine so the counters stay legible. Tapping a tool primes it — it
lifts, tilts and throws off a pulsing ring, the board pulses to show every tile
is now a target, and the footnote says what to do next. Each has its own
payoff: the hammer swings down and lands *before* anything breaks, the mix
tumbles the whole board through a spin and re-deals at the midpoint where every
tile is small and blurred, so the swap itself is invisible.

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

**Five kinds of level, in rotation**, so no two in a row ask the same thing:

| | Asks for |
|---|---|
| 🍓 | collect three fruit |
| 🍃 | collect two fruit **and** sweep the leaves |
| ✨ | **make boosters** (any kind) and collect a fruit |
| 🏆 | **reach a score** |
| 💣 | sweep the leaves **and** make boosters |

Which one you get is a pure function of the level number, so Level 34 is always
the same level. A sample of the opening run:

```
1: 9🍌            2: 10🍇 10🍏      3: 8,100🏆       4: 5🍃 2✨
5: 13🍓 13🍌 13🍇  6: 14🍓 14🍌 7🍃   7: 3✨ 15🍌       8: 12,600🏆
```

Goal sizes and the leaf count plateau around level 16 — a toddler game should
not get harder forever. Past that the variety comes from the rotation, which
fruit is asked for, and which shape the leaves make.

The booster goal counts **any** booster on purpose. Asking specifically for
bombs meant asking a three-year-old to engineer an L-shape deliberately;
measured, that produced one bomb in 27 moves against a goal of three — an
unfinishable level.

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
swell as they trade places. Fruit around a newly born booster flinch away from
it. The score number doesn't just drift off — it **flies to the score counter**
and lands on it, which is what actually connects the burst to the number going
up. Every blast also leads its own destruction by a beat — the beam or the ring
arrives visibly *before* the fruit it's hitting disappears, because firing both
on the same frame just read as "everything vanished".

**Nothing zooms.** Setting off a booster means tapping an already-selected tile
— which *is* a double tap, so the browser's double-tap-to-zoom was fighting the
game. Gesture and double-tap events are swallowed explicitly (iOS Safari
ignores `user-scalable`), and only the second tap of a fast pair is cancelled,
so ordinary taps still work.

**Sound.** Each fruit owns a note of the pentatonic scale, so clearing bananas
always sounds like bananas, and each cascade step lifts the whole chord — a long
chain plays a tune. Cascade cheers carry an emoji as well as a word, since the
audience can't read.

## Tech

One self-contained `index.html` — vanilla HTML/CSS/JS, zero dependencies, no
build step. Sound is synthesized with WebAudio (no audio files).

**Hybrid renderer.** Tiles are absolutely-positioned divs moved with CSS
transforms — GPU-composited, and they stay real elements so the board is
readable to a screen reader. Every *effect* (sparks, shards, rings, blooms,
blades, lightning) is drawn on a single `<canvas>` above the board by one rAF
loop with additive blending.

Why not WebGL: the board is 49 sprites and a few hundred particles, nowhere
near fill-rate or geometry bound, so a shader pipeline would buy nothing but
code — plus context-loss handling and no DOM to be accessible. What actually
hurt was creating and destroying a DOM node per particle (**242 nodes per
combo**, measured) and giving every effect its own CSS keyframe clock so
nothing could share a timeline. The canvas fixes both: **0 effect nodes**, one
clock, and effects that can overlap and glow into each other. Tiles stayed DOM
because ordinary movement was already smooth and that's where accessibility
lives.

Two things worth knowing if you touch it. A `<canvas>` is a *replaced element*,
so `inset` positions it but will not stretch it — the CSS size must be set
explicitly next to the backing-store size, or it silently lays out at the
device-pixel size. And effect expiry is driven by the clock, never by frames: a
hidden tab gets no rAF at all, which leaked to 239 stale effects in testing that
would all have dumped onto the screen at once on return.

Covers live in their own layer keyed to cells, not tiles, because tiles fall and
cells don't.

State lives under `match3-` localStorage keys: `match3-stars` (per level),
`match3-total` (points, kept forever), `match3-max` (highest level unlocked),
`match3-tools` (helper tool stock),
`match3-sound`, `match3-vibe`, and `match3-save` for mid-level resume. Levels
are deep-linkable (`#lvl-2`, `#free`) but you can't skip past what you've
unlocked. `prefers-reduced-motion` disables the decorative animation
while keeping the booster aim ring readable.

Run locally: open `index.html`, or `python3 -m http.server` from the repo root.
