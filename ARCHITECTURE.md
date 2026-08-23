# ARCHITECTURE.md

## Stack

- **Runtime:** Vanilla HTML5 / CSS3 / JavaScript (ES2020), no framework, no bundler.
- **Scripts:** Classic `<script>` tags only — games must run over `file://` (ES modules are blocked by CORS on `file://`).
- **Rendering:** `<canvas> 2D` for action games (Snake, Breakout, Block Drop, Flappy); DOM/CSS for board & UI games (Memory, Minesweeper, 2048, Tic-Tac-Toe, Type Storm, Simon).
- **Audio:** WebAudio API, synthesized tones, lazily created on first user gesture; stubbed in tests.
- **Persistence:** `localStorage` for best scores/settings (wrapped in a safe helper).

## Layout

```text
/
├── index.html              # Arcade hub: grid of game cards
├── package.json            # dev tooling only (tests); zero runtime deps
├── shared/
│   ├── styles.css          # design system: tokens, buttons, cards, overlays, HUD
│   └── common.js           # safeStorage, qs/qsa helpers, overlay manager, audio helper
├── games/
│   ├── game-01-snake/          index.html + style.css + game.js + README.md
│   ├── game-02-memory-match/   …
│   ├── game-03-minesweeper/    …
│   ├── game-04-2048/           …
│   ├── game-05-breakout/       …
│   ├── game-06-block-drop/     …
│   ├── game-07-flappy-glide/   …
│   ├── game-08-tictactoe/      …
│   ├── game-09-type-storm/     …
│   └── game-10-simon/          …
├── tests/
│   ├── helpers.mjs         # jsdom page loader, canvas 2D stub, key/click dispatchers
│   ├── run-all.mjs         # entry: node --test via npm test
│   └── <game>.test.mjs     # one smoke-test suite per game
└── sprints/                # sprint records SPRINT-00 … SPRINT-11
```

## Conventions

### Game module pattern

Every `game.js` follows one pattern so tests can drive it uniformly:

```js
(function () {
  'use strict';
  const Game = { state: 'idle', start(), reset(), /* pure logic fns */ };
  window.Game = Game;                 // exposed for tests
  document.addEventListener('DOMContentLoaded', init);
})();
```

- All DOM lookups happen in `init()`; logic functions stay DOM-free where possible.
- Game loop: `requestAnimationFrame` with delta-time for physics games; fixed-interval ticks for grid games.
- State machine string exposed as `Game.state`; UI reflects it via overlay show/hide.

### Shared UI system (`shared/styles.css`)

- CSS custom properties: colors, spacing, radius, shadow, font stacks.
- Components: `.btn`, `.btn.primary/.ghost`, `.card`, `.hud`, `.overlay`, `.badge`, `.game-header`.
- Dark arcade theme with per-game accent variable (`--accent`).
- Responsive: fluid type via clamp(); layouts tested at 360 / 768 / 1280 px widths.

### Testing architecture

- `tests/helpers.mjs` loads a game's `index.html` into jsdom, executes its scripts,
  installs a recording Canvas2D stub (fillRect/arc/etc.), and returns `{ window, Game }`.
- Each `*.test.mjs` uses Node's built-in `node:test` runner.
- Smoke tests assert: page parses & scripts run without error; game starts;
  representative interactions work; restart resets; win/lose transitions fire.
- `npm test` runs all suites; `npm run check` runs `node --check` on every JS file.

## Serving

Any static server works: `python3 -m http.server` or `npx serve`. No server required — opening any `index.html` directly is supported by design.
