# 🔢 2048 Merge

The viral sliding-tile puzzle. Merge equal numbers, chase the 2048 tile, then
keep going for the high score.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Slide tiles | `←` `↑` `→` `↓` or `WASD` · swipe on touch |
| New game | New Game button |
| Undo | ↶ Undo (one step) |

## Rules

- Every move slides all tiles; equal neighbours merge into their sum (once per move).
- Each valid move spawns one new tile (90% a 2, 10% a 4).
- Reach **2048** → win screen with "Keep Going" option.
- No moves left → game over. Best score saved locally.

## Files

- `index.html` · `style.css` (value-colored tiles, pop/merge animations) · `game.js`
  (pure move algorithm + DOM tile layer)

## Tests

Smoke tests: `tests/game-04.test.mjs` — run via `npm test`.
