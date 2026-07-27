# 🎈 Toddler Games

A little arcade of browser games for kids ages 3–6. No ads, no tracking, no
accounts, no build step — every game is one self-contained `index.html` that
works offline once loaded and fits an iPhone or iPad.

**Play:** https://yudongqagent.github.io/toddler-games/

| Game | | |
|---|---|---|
| 🐶 **[Sudoku Fun](games/sudoku/)** | picture & number sudoku with a real deductive hint engine | [docs](games/sudoku/README.md) |
| 🍓 **[Fruit Pop](games/match3/)** | swap fruit to pop three in a row, with cascades and boosters | [docs](games/match3/README.md) |

## Layout

```
index.html          home page — the game picker (thin: it just renders the registry)
games/games.js      THE REGISTRY — one entry per game
games/sudoku/       one folder per game, fully self-contained
games/match3/
.github/workflows/  GitHub Pages + Cloudflare Pages deploy
```

## Adding a game

The repo is arranged so that several people (or sessions) can build different
games at the same time without stepping on each other. Almost all of your work
happens in a folder nobody else touches.

1. **Make your folder.** `games/<your-id>/index.html` — one file, vanilla
   HTML/CSS/JS, zero dependencies, no build step. Add a `README.md` next to it
   if the game deserves one.
2. **Register it.** Append **one entry to the end of the list** in
   [`games/games.js`](games/games.js). That is the only shared file you edit,
   and appending at the end is the change least likely to conflict.
3. That's it. The home page picks it up automatically — you never edit
   `index.html` at the root.

### House rules

These keep the games feeling like one product, and keep the deploy trivial:

- **One file, zero dependencies.** No npm, no bundler, no CDN. Everything —
  markup, styles, logic, sound — lives in your `index.html`. It has to work
  from `file://` and offline after first load.
- **Namespace your storage.** Prefix every `localStorage` key with your game
  id: `match3-stars`, `match3-sound`, `match3-save`. Never read or write
  another game's keys — the one exception is the `progress()` function in
  your own registry entry, which reads your own key to show a star count on
  the home card.
- **Sound is synthesized.** WebAudio oscillators, no audio files. Ship a
  sound toggle and remember it.
- **Toddler-safe design.** Big touch targets, no fail states (nudge, don't
  punish), no time pressure, no reading required to play.
- **Accessible.** Never encode meaning in colour alone — pair it with a shape
  or an icon. Keep contrast strong and honour `prefers-reduced-motion`.
- **Mobile-first.** Portrait and landscape, safe-area insets, `100dvh`-safe
  layout. Assume a thumb, not a mouse.
- **Deep-link with the hash** (`#lvl-2`) so a level can be bookmarked, and
  save/resume progress so a closed tab isn't lost work.

## Deploying

`.github/workflows/deploy.yml` publishes the whole repo to GitHub Pages on
every push to `main`, and mirrors to Cloudflare Pages (reachable from mainland
China) when the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets exist.
Nothing to configure for a new game — a new folder just ships.

Run locally from the repo root:

```bash
python3 -m http.server
```
