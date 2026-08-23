# 🎵 Simon Says

Repeat the signal. Four pads, four tones, one extra step every round.

## Play

Open `index.html` in any browser, or head back to the [arcade hub](../../index.html).

## Controls

| Action | Input |
|--------|-------|
| Tap pad | Click / tap (or `G` `R` `Y` `B` keys) |
| Start / Play again | Button |
| Strict mode | Toggle — mistake ends the run |
| Mute | 🔊 toggle |

## Rules

- Watch the flashed sequence, then repeat it in order.
- Each round adds one step; playback speeds up slightly as rounds climb.
- Non-strict: a wrong pad replays the same sequence. **Strict**: instant game over.
- Best round saved locally.

## Files

- `index.html` · `style.css` (glowing lit pads) · `game.js` (sequence engine, WebAudio tones)

## Tests

Smoke tests: `tests/game-10.test.mjs` — run via `npm test`.
