# 🃏 Memory Card Match

Find every pair of emoji cards with the fewest moves — now with a 6×6 expert grid.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Flip card | Click / tap |
| Switch difficulty | `4 × 4` / `6 × 6` toggle |
| Restart | `↻ Restart` button |

## Rules

- Two flips per turn; matches stay face-up, mismatches flip back after a moment.
- Clear all pairs to win. The timer starts on your first flip.
- Stars by move efficiency (relative to pair count): ⭐⭐⭐ ≤ ~1.3× pairs,
  ⭐⭐ ≤ ~1.9× pairs, otherwise ⭐.
- Best time saved per difficulty.

## Files

- `index.html` · `style.css` (3D flip animation) · `game.js`

## Tests

Smoke tests: `tests/game-02.test.mjs` — run via `npm test`.
