# 💣 Minesweeper Classic

The all-time classic deduction game — first click always safe, flood-fill reveals,
flags, and a timer chasing your best.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Reveal cell | Left click / tap |
| Flag cell | Right-click · long-press · 🚩 Flag mode + tap |
| New game | 🙂 New button |
| Difficulty | Beginner 9×9·10 💣 / Intermediate 16×16·40 💣 |

## Rules

- Numbers count mines in the 8 neighbouring cells.
- Revealing a mine loses instantly; zero cells auto-expand.
- Clear every safe square to win. Best time saved per difficulty.
- First click of a round is never a mine.

## Files

- `index.html` · `style.css` (cell states, color-coded numbers) · `game.js`

## Tests

Smoke tests: `tests/game-03.test.mjs` — run via `npm test`.
