# ⭕ Tic-Tac-Toe vs AI

The classic duel with a proper minimax brain. Easy to beat on a good day —
Hard mode is mathematically perfect.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Place mark | Click / tap a square |
| Difficulty | Easy / Medium / Hard |
| Mode | 🤖 vs AI · 👥 2-Player (local) |
| Series reset / Next round | Buttons |

## Rules

- You are ✕; line up three in any row, column or diagonal.
- Rounds alternate the starting player. The series score tracks you/draws/AI.
- **Easy** blunders often, **Medium** sometimes, **Hard** never — perfect play.

## Files

- `index.html` · `style.css` (winning-line pulse) · `game.js` (minimax + difficulty noise)

## Tests

Smoke tests: `tests/game-08.test.mjs` — run via `npm test`.
