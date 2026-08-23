# 🧱 Brick Breaker

Classic wall-breaking action: angle your bounces, chase combos, survive three
levels of bricks with three lives.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Move paddle | Mouse / touch drag / `←` `→` |
| Launch ball | `Space` or click/tap |
| Pause | `Space` while playing |
| Restart | Enter on game-over, or button |

## Rules

- Higher bricks score more; each brick broken without touching the paddle raises
  the combo multiplier (+5 per combo step).
- Paddle edges send the ball at sharper angles (up to ±60°); the ball speeds up
  slightly on every paddle hit.
- 3 levels with taller walls and faster balls. Clearing all three grants a
  life-bonus. Lose all 3 lives → game over.

## Files

- `index.html` · `style.css` · `game.js` (fixed-substep physics, canvas renderer)

## Tests

Smoke tests: `tests/game-05.test.mjs` — run via `npm test`.
