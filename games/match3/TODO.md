# Fruit Pop — polish backlog

A holistic comparison against Candy Crush, ordered by how much each one changes
what the game feels like. Written after auditing the current build against what
the genre actually does ([game feel and juice](https://egmatic.com/blog/how-to-make-your-game-feel-good),
[Candy Crush breakdown](https://fayejstover.medium.com/game-breakdown-candy-crush-1d89f4f930f1),
[match-3 art direction](https://retrostylegames.com/portfolio/bonbons-crush-legend-match-3-game-icons-art-candy-crush/)).

The honest summary: the *systems* here are in decent shape — cascades, boosters,
blockers, goals, sound. What is behind is the **presentation of a single match**,
the **readability of the pieces**, and the **sense of escalation**. Those are the
first three sections.

---

## 1. The disappearing animation — the biggest single gap

> **1.1–1.4 done.** The tile comes apart now: the shell bursts outward while the
> fruit squashes and goes, both with a wind-up frame and a blown-out flash at the
> moment of destruction, and debris is thrown away from wherever the clear
> started. 1.5 remains.

Right now a matched fruit does one thing: the whole tile scales up, rotates and
shrinks to nothing, with canvas sparks thrown behind it. It reads as *deleted*.
A Candy Crush candy reads as *destroyed* — it comes apart.

- [x] **1.1 Anticipation.** *(done)* The fruit should squash down a frame before it goes.
      A burst with no wind-up has no weight. (We flash it white, which is a
      colour change, not a movement.)
- [x] **1.2 Break the tile into its parts.** *(done)* The backing and the fruit should
      separate — the candy square shatters outward while the fruit itself pops.
      One object scaling to zero is the giveaway that this is a div, not a sweet.
- [x] **1.3 Debris with direction.** *(done)* Shards currently spray symmetrically. They
      should inherit the direction of the match — a horizontal run throws
      sideways, a blast throws away from its centre.
- [x] **1.4 A real flash frame.** *(done)* One or two frames of a bright silhouette at the
      moment of destruction, which is what sells impact in every action game.
- [ ] **1.5 Stagger within a match.** Three fruit in a run currently pop on a
      distance-based delay from the move. They should pop *along* the run, so you
      read the line.

## 2. Tile identity — the readability gap

Every fruit is the same rounded square with a different emoji on it. Candy Crush
gives **each colour its own silhouette** (round, square, teardrop, oval,
pentagon). That is not decoration: shape is the fastest cue the eye resolves, and
it is the reason their board is legible at speed and to a colour-blind player.
We lean on hue and a glyph, which are the two weakest cues.

- [ ] **2.1 A distinct silhouette per fruit.** Six shapes, one per kind. This is
      the single biggest visual upgrade available and it also fixes colour-blind
      accessibility, which hue-only never can.
- [x] **2.2 Idle life.** ~~Candy Crush candies blink and shift while you think.
      Our board is frozen except the duckling and the gum.~~
      **TRIED AND REVERTED — do not redo this.** A staggered idle bob was built,
      shipped and pulled the same day. It is not a tuning problem, it is the
      wrong idea for this game: *motion competes with visual search*. While a
      player is scanning the board for a move, anything that moves pulls the eye
      away from the thing they are hunting for, and the player here is three
      years old and already working hard to find a match. Delight and search are
      in direct conflict on a match-3 board and search has to win. If the board
      ever needs life, it should come at moments when nobody is searching — the
      level intro, or after a win — not underneath the core task.
- [ ] **2.3 Selection should lift.** Tapping wiggles the tile in place. A
      selected piece should lift toward the player with a shadow underneath it.
- [ ] **2.4 Drag should follow the finger.** Currently a swipe past a threshold
      triggers a swap. The piece should move *with* the finger and snap back if
      released short — the difference between operating a UI and handling an
      object.

## 3. Escalation — cascades should build

A three-chain and a one-chain look nearly identical apart from a toast. The pitch
ladder does the work in audio; the visuals do not follow.

- [ ] **3.1 Scale the burst with cascade depth.** More debris, bigger flash,
      longer ring at depth 3 than at depth 1.
- [ ] **3.2 A finale.** Candy Crush's "Sugar Crush" spends leftover moves as
      fireworks. Finishing a level here just shows a card. Leftover moves should
      *do* something.
- [ ] **3.3 Board-level reaction.** The tray should respond to a big cascade —
      a pulse of light across it, not a shake (shake was removed deliberately and
      should stay removed).

## 4. Boosters — what they do should be visible on the tile

- [ ] **4.1 The star does not show its axes.** It clears a row and a column; the
      tile should say so. Wrapped/striped candies in Candy Crush are readable
      without ever firing one.
- [ ] **4.2 The bomb does not show its radius.** Its halo is decorative rather
      than sized to what it takes.
- [ ] **4.3 Combination previews.** Selecting a booster lights up its targets,
      which is good. Selecting *two* boosters should preview the combined blast.

## 5. Level variety — the fun gap

Board shapes were tried and removed on purpose (a clipped board is a smaller
board). So variety has to come from elsewhere, and right now every level is the
same pink rectangle with different chips at the top.

- [ ] **5.1 Themed backgrounds by level range.** Every ten levels should look
      like somewhere new. Cheap to do with the existing gradient and bubbles.
- [ ] **5.2 The tray should be dressed.** It is a plain translucent rectangle.
      A frame with some character costs nothing at runtime.
- [ ] **5.3 A level intro that says what is new.** When a level introduces
      bubblegum or a machine for the first time, say so.
- [ ] **5.4 More shapes of objective.** Ten exist; they are all "reach a number".
      None of them ask for a *place* (clear a corner, reach the bottom row).

## 6. Smaller items

- [ ] **6.1 Landing bounce.** Fruit stop dead. A small settle on impact.
- [ ] **6.2 Score should fly to the counter**, not fade in place.
- [ ] **6.3 Reshuffle is abrupt** — the board re-deals with a spin; it should
      explain itself.
- [ ] **6.4 Star fill on the win card** should count up, not appear.
- [ ] **6.5 No-moves state.** Currently silently reshuffles. Say something.
