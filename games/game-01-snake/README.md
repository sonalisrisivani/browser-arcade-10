# 🐍 Neon Snake

Classic snake with a neon arcade look. Eat the glowing orbs, grow longer, and
survive as the game speeds up.

## Play

Open `index.html` in any browser (double-click works — no server needed), or
return to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Steer | `←` `↑` `→` `↓` or `W A S D` |
| Start / Restart | `Enter` or on-screen button |
| Pause / Resume | `Space` or on-screen button |
| Touch | On-screen d-pad (shown on touch devices) |

## Rules

- Each orb: **+10 × level** points and +1 segment.
- Every 5 orbs → level up, snake speeds up.
- Hit a wall or your own body → game over.
- Best score is saved locally.

## Files

- `index.html` — page structure & overlays
- `style.css` — board styling and touch d-pad
- `game.js` — full game logic (grid, loop, rendering)

## Tests

Smoke tests live in `tests/game-01.test.mjs`. Run all games' tests from the
repo root:

```bash
npm test
```
