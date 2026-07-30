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
| a corner or T | 💣 **bomb** | everything around it, **twice** |
| five in a line | 🌈 **rainbow** | every fruit of one colour |

**The bomb goes off twice, and it is the bomb itself that goes off twice.** It
survives its own first blast, falls into the hole it just made, and detonates
again from wherever it lands — so the second blast hits a different patch of
board rather than the same one refilled. Watching it drop through the gap it
opened is the whole point. Measured, a tap takes 18 tiles where it used to take
9. Doubling the radius instead would have swallowed a quarter of the board in one
go and left nothing to watch.

The extra life is one flag spent on first firing, so the second blast consumes
the bomb like any other booster, and a bomb caught in *that* blast gets its own
extra life — chains still work and still terminate. The pending blasts fire at
the top of `resolve()`, before `groups()`, because a cascade that matched the
surviving bomb away would otherwise swallow its second blast silently.

Getting this to work meant collapsing a duplicate. `activate()` used to do a
tapped booster's first blast itself *and* mark the tile fired so `expand()` would
skip it — two copies of the rule for how a booster goes off. That is how a tapped
bomb once ended up clearing nothing but itself when one copy lost a line, and it
would have quietly eaten the second blast too. `expand()` is now the only thing
that detonates a star or a bomb, anywhere. A rainbow is still fired by hand in
the two places that have to tell it which colour to hunt.

A rainbow set off by something *else* — a star's line sweeping over it, a bomb
catching it — hunts the most common colour, the same one it takes when you tap
it, so a rainbow does the same thing however it goes off. It used to be handed
`-1` as the colour to hunt, which is the rainbow's own kind: it swept the board
looking for other rainbows, found none, and vanished having done nothing, so a
line blast could swallow your rainbow for free. Measured before the fix, a star
crossing a rainbow left 12 of the 14 tiles of that colour standing. A chained
rainbow also throws its bolts now — a bare shockwave gave it the same anonymous
ring as anything else, so even once it worked you couldn't see that it had.

Swap two boosters together and they combine — a bomb pair makes one much
bigger blast, star + bomb makes a three-wide cross, and a rainbow turns every
fruit of a colour into the other booster and sets them all off at once. The
combined blasts draw what they actually do: star + bomb throws **three lanes of
light each way**, widening outward from the centre lane so it reads as one
growing cross (it used to clear a three-wide cross while drawing a one-wide
one — the visual was describing a different move than the game made), and a
bomb's wave is a **square**, because a square is what a bomb clears. That
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

- 🔨 **hammer** — tap any single fruit and pop it (set off a booster with it too, or smash a whole block of frost off in one swing)
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

The hammer refuses a duckling outright, without spending, because a duckling has
to *reach the floor* — smashing it would undo the very goal you were spending
the tool on. Both it and frost used to take your hammer and then do nothing at
all: `clearCells` won't pop a blocker or a frozen tile, and by the time it
declined the tool was already gone.

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

**Levels never run out.** Beating one unlocks the next; the menu keeps every
level you've reached, with its stars, and a **total score that never resets**.

**A big board, and special tiles on it.** The board is **8×8** and fills as much
of the screen as the chrome allows — a bigger board means more room for chains
and bigger blasts. Cutting cells out of the board to make silhouettes was tried
and rejected: a clipped board is a *smaller* board, and small is the opposite of
fun. Levels get their identity from what's **on** the board instead:

| | |
|---|---|
| 🍃 **leaves** | cover a fruit; sweep them by popping the fruit under them |
| 🧊 **frost** | holds a fruit in place; match that fruit, or anything beside it, to chip the ice away and get the fruit back |
| 🐤 **duckling** | can't be matched, but *can* be swapped; falls with everything else and is home when it reaches the floor, so you have to clear its column out from under it |
| 🎁 **gift** (level 20+) | two knocks from matches beside it and it bursts open, leaving a **booster** behind |
| 🥥 **coconut** (level 30+) | ignores ordinary matches completely — only a booster going off over it cracks it |

A duckling is swappable and frost is not, which sounds inconsistent until you
play it. Frost is scenery — there is nothing to decide about it until you break
it. A duckling is a piece with a destination, and refusing to let you move it
meant a duckling parked over a column you had no way to clear turned the level
into a coin flip. Swapping one still obeys the ordinary rule: the duckling can
never match, so the move only stands if the fruit taking its place makes a run.
Nothing about "every move is a match" is bent — you just get to steer. Measured
after the change, the bot brought the duckling home on 4 of 5 drop levels inside
20 moves, against roughly half before.

Collecting a duckling used to leave a **hole in the floor**. `collectDucks()`
runs at the end of `gravity()` and empties the cell the duckling was standing in,
but that was the end of the fall — nothing was ever going to come along and close
the gap, so the column sat with gaps under it until some unrelated move happened
to trigger another pass. Gravity now recurses when it collects one, which
terminates because every pass consumes at least one duckling.

Frost is a **layer on a fruit**, not a tile of its own. That matters three ways:
the board never loses a cell to it, you can see which fruit you're about to
free, and it can't render as a blank white square — which is exactly what an
opaque blue block with an 🧊 glyph did. Most frost is a **single layer** you can free in one match; thick two-layer
blocks creep in from level 12 as a growing minority. Uniform double frost was
tedious. A thick block reads as a heavy frosted slab; a single layer is
thinner, inset smaller and visibly fractured, with the fruit clear underneath.

### Why the frost is built as a rim and a window

Two earlier attempts at the frost both failed the same way on a real phone, and
the reason was architectural rather than a matter of taste. A stack of
translucent gradients takes its final colour from whatever sits underneath, and
underneath is one of six saturated tile colours — so the same frost came out
grey over a blueberry, lavender over grapes and khaki over a banana. Six
different results, none reading as ice, and no amount of alpha-tuning fixes
that when the input is what varies. Blur can't unify them either:
`backdrop-filter` needs the `-webkit-` prefix on iOS Safari, and its wash is
what made frozen fruit look flat white on an iPhone.

So the frost is a **rim** plus a **window**. The rim is nearly opaque, which
makes its colour fixed no matter what it covers, and it carries the entire
identity of the material. The window is only lightly veiled, so the fruit shows
through sharp and in its own colour. Thickness then becomes a real variable: how
far the rim intrudes, and how much the window is veiled. Both states are
obviously the same substance — which a white X over a grey wash never was.

The rim is **blue**, with white as a specular edge one thin ring wide on top of
it. Stacked `inset` box-shadows paint front-to-back, so a narrow white spread
listed before a wider blue spread reads as a lit edge on a blue body. Building
it the other way round — a wide near-white rim — is how the frost came out
looking bleached. Facets are corner wedges rather than lines across the middle,
because three crossing white lines landed as a struck-through "cancelled" mark
straight over the fruit. The single fracture on the thin state is masked so it
fades out instead of stopping in mid-air.

The goal chip uses the same build with the window pulled in tight: at 24px
there's no fruit behind it for the window to be a window *onto*, so the collar
has to carry the whole read.

Chip the last layer and the fruit is simply yours, sitting right there ready to
match.

**A frozen fruit counts towards a match.** It can't be *moved* — that's what
being frozen means — but the fruit inside still has a colour, so you can break
frost head-on by lining up what's inside it instead of only nibbling from beside.
It doesn't pop: it takes a hit on the ice while the free fruit in the run pop
around it. Ice in a run is chipped explicitly rather than left to the
"neighbour of a cleared cell" rule, which misses the far ends of
`[frozen, frozen, free, frozen, frozen]` — both are in the match but neither is
next to the one cell that actually clears.

A run needs **at least one unfrozen fruit** to count. Three frozen fruit in a
line would clear nothing at all, and `resolve()` loops until the board stops
producing groups, so it would spin on that group forever. With that rule every
pass either clears a tile or chips a layer, both bounded by the board, so the
cascade terminates — and `resolve()` carries a hard iteration cap anyway, because
"almost certainly terminates" is not a good enough guarantee for a toddler's
game. Boosters are also barred from spawning on a frozen cell now that frozen
fruit join runs: one sealed under ice can't be seen, tapped or swapped, so it
would just go to waste.

The duckling is the one true blocker — not fruit, never poppable — and uses a
kind index the matcher already skips.

**Levels are generated, and there is no end to them.** Ten kinds of objective are
drawn from a menu that unlocks gradually, so a new idea always arrives on its
own — and the unlocks are spread far enough apart that the game is still handing
you something new at level fifty.

| Unlocks | Objective |
|---|---|
| 1, 3, 4 | collect a fruit · sweep leaves · reach a score |
| 5, 6, 8 | make boosters · bring a duckling home · break ice |
| **20** | 🎁 open gifts |
| **30** | 🥥 crack coconuts |
| **40** | 💥 combine two boosters |
| **50** | 🔥 set off a chain of three |

### The late game

Everything before level 20 is about *clearing* things. The four late objectives
are deliberately not more of that — each one asks for a different kind of move,
because a hundred levels of "clear more of it, faster" is just one level with a
bigger number on it.

**🎁 The gift is the first blocker you are pleased to see.** Two knocks from
matches beside it — the same rule as frost, so there is nothing new to learn —
and it bursts open leaving a **booster** on its cell. Everything else on the
board is an obstacle; this one is a reward sitting behind a small errand, which
makes a board with gifts on it read completely differently. It never pays out a
rainbow: a free rainbow from a blocker you were going to break anyway is the
biggest thing in the game arriving without the straight five that earns it.

**🥥 The coconut only listens to blasts.** Ordinary matches beside it do
nothing at all — it takes a booster going off over it, which finally makes the
late game about *using* boosters instead of hoarding them. It is matte and dull
next to the candy on purpose, because it must not look like something you could
match. Note that a bomb cracks one outright: a bomb detonates twice, each blast
is its own clear, and two hits is a coconut. That is a synergy worth having
rather than a bug — it is the reward for reading what the bomb does.

**💥 Combining** asks you to swap one booster straight onto another, which is
the best thing in the game and the thing a child is least likely to discover
alone. **🔥 Chains** ask for one clear that keeps going three times over, which
you cannot do on demand — you do it by making bigger matches and letting the
board pay you back.

Every one of them is priced off **measured** throughput, and measuring caught two
real design faults that reasoning had not.

**Combining scored zero in 132 moves of bot play.** Two boosters have to be alive
*and* adjacent, which essentially never happens by accident — the same shape of
mistake as the old "make 3 bombs" goal. The fix is the same too: the hint has to
steer at it, exactly as it already steers at leaves, ice and ducklings. A booster
pair was only ever registered as a *fallback*, taken when no scoring move existed
at all, so on a busy board the hint never once showed the player the move the
level was asking for. With the steering in, it lands at 0.083/move and the goal
finishes in 12 moves of a 35-move budget.

**Chains turned out more than twice as common as guessed** — 0.23/move measured
against an estimate of 0.10 — so a chain goal was finishing in about four moves
against a budget built for thirty. Repriced, and the ask raised from one chain to
two.

The coconut is the rarest thing in the game by some distance, since it needs a
booster to land *and* to land near one. With two on the board it took 31 moves of
a 38-move budget, which is finishable but a long errand for a three-year-old, so
a level that asks for one now puts **three** on the board — more targets rather
than a longer level. That brought it to 13–19 moves across three levels. There is
a floor under it regardless: two hammers crack a coconut outright, and you always
have hammers, so the goal can never strand anyone.

### The goal chips

Each chip **fills up** as you go, behind the icon and the number. Most of the
people playing this cannot read "7/10", and a bar that visibly grows is the only
part of the chip they can actually use. Finishing one turns it gold and gives
the icon a spin.

**Tap a chip and it tells you what it wants and how to get it** — a title
("Break 10 ice blocks") over one plain sentence naming the action ("Match fruit
right NEXT to frozen fruit to chip the ice off"). A chip can only ever be a
picture and a number; there is no room on it to say that ice breaks from beside
rather than on top, or that a duckling can be slid sideways, and those are
exactly the rules nobody works out unaided. Tapping the open one closes it,
anything else on screen closes it, and it times out on its own so it can never
be left covering the board. The bubble is `pointer-events:none`, so a tap that
dismisses it still reaches the tile underneath.

They're drawn from a **seeded** stream, not `Math.random`, and the seed is the
level number. That distinction matters: a level is genuinely varied, but Level
34 deals the same board every time, so "Again" replays what you just failed and
the stars you earned mean something. Rolling fresh on every visit would quietly
break both. A sample of the opening run:

```
1: 9🍏         2: 10🍓 10🍇     3: 11🍇 11🍓    4: 12🍌 9,000🏆
5: 13🍇 13🍓 13🍊  6: 14🍏 14🫐 7🍃  8: 1🐤 16🫐 16🍇  9: 17🍓 1🐤 6🧊
```

Goal sizes and the leaf count plateau around level 16 — a toddler game should
not get harder forever. Past that the variety comes from the rotation, which
fruit is asked for, and which shape the leaves make.

The booster goal counts **any** booster on purpose. Asking specifically for
bombs meant asking a three-year-old to engineer an L-shape deliberately;
measured, that produced one bomb in 27 moves against a goal of three — an
unfinishable level.

There is only ever **one** duckling, for a related reason. A duckling descends
only when its own column clears beneath it, and the final row is one specific
cell that comes up about once in eleven moves — so the last duckling has a long
tail. Two of them lost more runs than they won even with the hint steering hard
toward them. The hint scores every candidate move by how much it advances what
the level still wants (a duckling's column, a block of ice, a leaf), which is
what makes specific-cell objectives progress at all; and the 🔨 hammer is a
direct answer to a stubborn last row.

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

**Transient FX classes are swept at rest.** A tile carries two kinds of class:
what it *is* (`ice2`, `sp1`, `duck`), which `paint()` owns and rebuilds, and
what it is *doing* (`charge`, `suck`, `swapping`, `firing`, `mixing`, `dropin`,
`sweepout`), which is added by one step of a cascade and removed by a later one.
Every one of those removals is conditional on some code path reaching it, so any
early return strips a tile's future and leaves the class on it permanently —
`paint()` will never take it off, because it doesn't know the class exists. That
is how frozen fruit ended up stuck scaled-up and bleached until a reload: the
pre-pop flash was added to every matched cell, and the loop that removes it
returns early for frost and blockers. Both halves are fixed — the flash is only
put on fruit that will actually pop, and `fxSweep()` clears the whole family
whenever the board comes to rest. One `querySelectorAll` per move buys a
self-healing invariant instead of a permanent artifact. `born`, `land` and
`push` are deliberately excluded (their timers are unconditional and may still
be mid-flight), as are `sel`, `aim` and `nudge` (meant to persist while idle).

State lives under `match3-` localStorage keys: `match3-stars` (per level),
`match3-total` (points, kept forever), `match3-max` (highest level unlocked),
`match3-tools` (helper tool stock),
`match3-sound`, `match3-vibe`, and `match3-save` for mid-level resume. Levels
are deep-linkable (`#lvl-2`, `#free`) but you can't skip past what you've
unlocked. `prefers-reduced-motion` disables the decorative animation
while keeping the booster aim ring readable.

Run locally: open `index.html`, or `python3 -m http.server` from the repo root.
