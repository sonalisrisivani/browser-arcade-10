# 🟦 Block Drop

The falling-block classic. Rotate and stack tetrominoes into complete lines
before the well fills up.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Move left / right | `←` `→` |
| Rotate CW / CCW | `↑` or `X` · `Z` |
| Soft drop | `↓` |
| Hard drop | `Space` |
| Pause | `P` |
| Touch | On-screen button pad |

## Rules

- Complete rows vanish: 1/2/3/4 rows score 100/300/500/800 × level.
- Soft drop +1/cell, hard drop +2/cell.
- Every 10 lines → next level, faster gravity.
- The pale ghost preview shows the landing spot. When a new piece can't spawn,
  it's game over. Best score saved locally.

## Files

- `index.html` · `style.css` · `game.js` (rotation matrices + wall kicks, gravity loop, canvas renderer)

## Tests

Smoke tests: `tests/game-06.test.mjs` — run via `npm test`.
