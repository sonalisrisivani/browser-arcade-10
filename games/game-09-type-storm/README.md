# ⌨️ Type Storm

Falling-word typing action. Your WPM is your weapon; your accuracy is your armor.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Type | Physical keyboard · tap field for soft keyboard |
| Start / Pause / Resume | Buttons |

## Rules

- Type any falling word completely to destroy it — first letter locks the target.
- Wrong letters hurt accuracy but never break progress inside a word.
- Score = length × 10 × streak multiplier (up to ×5) + level bonus.
- A word that reaches the red line costs a life. Three lives.
- Every 10 destroyed words the storm levels up: faster falls, tighter spawns.
- Live stats: WPM (correct chars ÷ 5 per minute) and accuracy %.

## Files

- `index.html` · `style.css` · `game.js`

## Tests

Smoke tests: `tests/game-09.test.mjs` — run via `npm test`.
