/* ===========================================================================
   THE GAME REGISTRY — the only shared file a new game has to touch.

   To add a game:
     1. Create  games/<id>/index.html   (self-contained, no build step)
     2. Append ONE entry to the end of the list below.

   Nothing else changes. Keeping every new entry an append at the bottom means
   two sessions adding two games merge cleanly.

   Fields
     id        folder name under games/ — also the link target
     name      big title on the card
     tagline   one short kid-readable line
     emoji     the face of the card
     cast      3–4 extra icons that drift around behind the badge
     colors    [from, to] card gradient; pick something distinct from the rest
     ink       text colour on the card ('dark' or 'light')
     progress  optional () => string — a badge (usually stars) read from that
               game's own localStorage. Owned by the game, so nobody else's
               storage keys are involved.
   ======================================================================== */

const GAMES = [

  {
    id: 'sudoku',
    name: 'Sudoku Fun',
    tagline: 'Fill every row with no repeats',
    emoji: '🐶',
    cast: ['🐱', '🐼', '🦊', '🔢'],
    colors: ['#8f7bff', '#6bb8ff'],
    ink: 'light',
    progress() {
      try {
        const s = JSON.parse(localStorage.getItem('sudoku-stars') || 'null');
        if (!s) return '';
        const all = [].concat(s.classic || [], s.animal || []);
        const n = all.reduce((a, b) => a + (b || 0), 0);
        return n ? '⭐ ' + n : '';
      } catch (e) { return ''; }
    },
  },

  {
    id: 'match3',
    name: 'Fruit Pop',
    tagline: 'Swap fruit to pop three in a row',
    emoji: '🍓',
    cast: ['🍌', '🍇', '🍏', '🍊'],
    colors: ['#ff9a62', '#ff6f91'],
    ink: 'light',
    progress() {
      try {
        const s = JSON.parse(localStorage.getItem('match3-stars') || 'null');
        if (!s) return '';
        const n = Object.values(s).reduce((a, b) => a + (b || 0), 0);
        return n ? '⭐ ' + n : '';
      } catch (e) { return ''; }
    },
  },

  // ↓ new games go here ↓

];
