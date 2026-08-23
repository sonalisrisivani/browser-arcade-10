# 🐤 Flappy Glide

One-button endurance flying. Gravity never sleeps; the pipes keep coming.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Flap | `Space` / click / tap anywhere on the field |
| Pause | `P` |
| Restart (after crash) | `R` or button |

## Rules

- Every pipe passed = 1 point. Gaps shrink and scroll speed rises with score.
- Touching a pipe or the ground ends the run. The ceiling just pushes you back.
- Medals at 10 / 25 / 50 points: 🥉 🥈 🥇. Best score saved locally.

## Files

- `index.html` · `style.css` · `game.js` (dt-scaled physics, parallax clouds, circle-rect collision)

## Tests

Smoke tests: `tests/game-07.test.mjs` — run via `npm test`.
