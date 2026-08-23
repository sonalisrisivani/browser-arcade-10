# DECISIONS.md

Concise log of significant engineering decisions.

| # | Decision | Rationale | Alternatives considered |
|---|----------|-----------|------------------------|
| D1 | Vanilla HTML/CSS/JS, no framework | 10 small isolated games; zero build step; runs forever; each game opens via `file://` | React/Vite (build complexity, dep churn), Phaser (heavy for these scopes) |
| D2 | Classic scripts, no ES modules in games | ES modules fail over `file://` CORS; requirement says independently runnable | Bundling everything (defeats isolation) |
| D3 | Shared design system in `shared/styles.css` + `shared/common.js` | Consistent polish across 10 games without duplicating CSS; still tiny (~1 file) | Per-game copies (drift), full component framework (over-engineering) |
| D4 | Canvas for Snake/Breakout/Tetris/Flappy; DOM for others | Matches idiomatic implementation per mechanic; DOM suits grids/cards/text/audio pads | All-canvas (worse a11y/DOM testing) |
| D5 | Tests: Node built-in `node:test` + jsdom with canvas stub | No browser available in environment; jsdom exercises real DOM logic; single dev dependency | Playwright/Puppeteer (no Chrome binary present; large download rejected), manual-only testing (not verifiable/repeatable) |
| D6 | `window.Game` exposure per game | Uniform test seam; keeps logic testable without DOM | Export via modules (breaks file:// rule) |
| D7 | localStorage wrapped in safe helper | jsdom/localStorage edge cases and privacy-mode browsers must not crash games | Direct access (fragile) |
| D8 | WebAudio synthesized, lazy-init after first gesture | No asset downloads; autoplay policies respected | Audio files (repo bloat) |
| D9 | One commit+push per completed game | Required traceability; bisectable history | Batch commits (rejected by spec) |
| D10 | Repo name `browser-arcade-10` under account `sonalisrisivani` | Descriptive, matches project scope | ox-test (dir name, not descriptive) |

Plan changes: none so far.
