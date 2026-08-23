# Sprint 2: GAME-02 — Memory Card Match

## Objective

Implement, verify and ship `games/game-02-memory-match` per GAME_PLAN.md Game 02 spec.

## Tasks

- [x] Scaffold `games/game-02-memory-match/` (index.html, style.css, game.js, README.md)
- [x] Implement gameplay (deck deal/shuffle, flip-2 turns, match persistence, 750ms flip-back)
- [x] Polish UI (3D flip animation, HUD with moves/time/pairs/best, star win modal, 4×4 & 6×6 toggle)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-02.test.mjs`

## Implementation Notes

- Stars scale with pair count: ⭐⭐⭐ ≤ ~1.3×pairs, ⭐⭐ ≤ ~1.9×pairs.
- Timer starts on first flip; best time persisted per difficulty via Arcade.storage.
- Board lock during mismatch resolution prevents third-card flips.

## Testing

- [x] `npm run check` — all files OK
- [x] `node --test tests/game-02.test.mjs` — **12/12 green**
- [x] Full suite: 27/27 green across games 01–02
- [x] Suites exit cleanly without force-exit flags

Coverage: board build · first-flip start · double-flip rejection · matched-pair
persistence · mismatch flip-back timing + unlock · timer tick/stop · full-solve win
overlay with stars/stats · best-time storage + display · restart reshuffle/reset ·
6×6 difficulty switch · Play Again · rating thresholds.

## Problems Encountered

1. jsdom supplies no `localStorage` on opaque `file://` origins → persistence silently absent.
2. `pretendToBeVisual` kept the Node event loop alive after green suites (120s hang).
3. Test-side: single flip does not count a move (initial expectation wrong); bogus dataset assertion removed.

## Resolution

1. Harness now polyfills localStorage/sessionStorage (Failure 2).
2. Removed `pretendToBeVisual`; harness rAF shim retained (Failure 3).
3. Corrected assertions to match specified game rules.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green (27/27 total)
- [x] Docs updated (README/PROGRESS/EXECUTION/FAILURES)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-02): build memory card match`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
