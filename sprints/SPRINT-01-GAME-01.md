# Sprint 1: GAME-01 — Snake

## Objective

Implement, verify and ship `games/game-01-snake` per GAME_PLAN.md Game 01 spec.

## Tasks

- [x] Scaffold `games/game-01-snake/` (index.html, style.css, game.js, README.md)
- [x] Implement full gameplay (21×21 grid, tick movement, food spawn, growth, speed levels)
- [x] Polish UI (neon header/HUD, start/pause/game-over overlays, touch d-pad, responsive canvas)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-01.test.mjs`

## Implementation Notes

- Direction queue prevents 180° reversals and double-turns per tick.
- Level = floor(foods/5)+1; interval = max(60, 150 − 15×(level−1)); score = 10 × level per orb.
- Auto-pause on window blur (also serves as test loop-stop seam via `Game.halt`/blur).
- Best score persisted through `Arcade.storage` safe wrapper.
- Rendering: rounded segments with head glow, pulsing cyan orb, subtle grid.

## Testing

- [x] `node --check games/game-01-snake/game.js` (via npm run check: 5/5 files OK)
- [x] `node --test tests/game-01.test.mjs` — **15/15 green**
- [x] Full suite still green
- [x] Hub page loads with updated card (jsdom)

Coverage: page load & API exposure · start button · step movement · arrow/WASD steering ·
reversal blocking · eating (score/growth/respawn) · level-up + speed-up at 5 foods ·
wall death overlay · self death · restart reset · pause/resume via Space+button ·
Enter restart from game-over · blur auto-pause · rAF loop advance · HUD values · touch d-pad.

## Problems Encountered

1. Test harness initially aliased `clickAt` losing the window arg → clicks hit undefined nodes.
2. Two tests assumed movement in idle state / food behind direction of travel.
3. jsdom-realm objects fail `deepStrictEqual` against Node-realm literals.

## Resolution

1. Added explicit `click = (el) => clickAt(win, el)` helper in the suite.
2. Corrected tests to start game first / place food ahead of travel.
3. Replaced cross-realm deep-equals with field-level assertions.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green for this game
- [x] Docs updated (README/PROGRESS/EXECUTION)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-01): build snake game`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
