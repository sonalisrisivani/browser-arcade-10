# 🕹️ Browser Arcade — 10 Games

Ten polished, independently playable browser games in one repository. Built with
vanilla HTML/CSS/JavaScript — no frameworks, no build step. Open any game's
`index.html` and play.

> This project is being built autonomously, one sprint per game. Progress is tracked
> in [`PROGRESS.md`](PROGRESS.md); live agent state in [`EXECUTION.md`](EXECUTION.md).

## The games

| # | Game | Type | Status |
|---|------|------|--------|
| 1 | Neon Snake | Canvas arcade | ✅ |
| 2 | Memory Card Match | DOM cards | ⬜ |
| 3 | Minesweeper Classic | DOM grid logic | ⬜ |
| 4 | 2048 Merge | Swipe/merge puzzle | ⬜ |
| 5 | Brick Breaker | Canvas physics | ⬜ |
| 6 | Block Drop (Tetris-style) | Falling-block puzzle | ⬜ |
| 7 | Flappy Glide | One-button physics | ⬜ |
| 8 | Tic-Tac-Toe vs AI | Minimax AI board game | ⬜ |
| 9 | Type Storm | Typing action | ⬜ |
| 10 | Simon Says | Audio/visual memory | ⬜ |

Status: ⬜ planned · 🚧 in progress · ✅ complete

## Technology

- Vanilla **HTML5 / CSS3 / JavaScript** (ES2020), classic scripts so every game runs over `file://`
- `<canvas>` 2D for action games; DOM/CSS for board & UI games
- **WebAudio** synthesized sound (no assets)
- `localStorage` best scores via a safe wrapper
- Shared design system in [`shared/styles.css`](shared/styles.css)
- Tests: Node's built-in runner (`node:test`) + **jsdom** with a stubbed canvas context

## Project structure

```text
index.html          Arcade hub page
shared/             Design system + JS helpers
games/game-01…10/   Each game fully isolated (html/css/js/readme)
tests/              jsdom smoke tests, one suite per game
sprints/            Sprint records SPRINT-00 … SPRINT-11
PROJECT/GAME_PLAN/ARCHITECTURE/EXECUTION/PROGRESS/DECISIONS/FAILURES .md
```

## Run locally

No install needed to play:

```bash
# either open a file directly
open games/game-01-snake/index.html

# or serve the hub
python3 -m http.server 8080     # → http://localhost:8080
```

## Tests

```bash
npm install        # dev-only: jsdom
npm run check      # syntax-check all JS
npm test           # smoke-test all games (start / interact / restart / states)
```

Each test loads a real game page into jsdom, drives it with synthetic keyboard,
mouse and touch events, and asserts state transitions.

## Development process

The repository is executed as autonomous sprints (`sprints/SPRINT-XX-*.md`).
Every completed game is committed and pushed immediately:

```text
feat(game-01): build snake game
```

See [`DECISIONS.md`](DECISIONS.md) for engineering rationale and
[`FAILURES.md`](FAILURES.md) for incident records.

## Future improvements

- PWA/offline support per game
- Global high-score table (optional backend)
- Additional levels/modes per game
- Visual theme switcher
