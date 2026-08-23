# Sprint 6: GAME-06 — Block Drop

## Objective

Implement, verify and ship `games/game-06-block-drop` per GAME_PLAN.md Game 06 spec.

## Tasks

- [x] Scaffold `games/game-06-block-drop/` (index.html, style.css, game.js, README.md)
- [x] Implement gameplay (7 tetrominoes, rotation+kicks, soft/hard drop, line clears, levels, next preview, ghost)
- [x] Polish UI (well canvas, preview panel, HUD, overlays, touch pad)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-06.test.mjs`

## Implementation Notes

- Rotations precomputed from base matrices (transpose+reverse), 4 states per type.
- Wall kicks try offsets [0,-1,+1,-2,+2].
- Gravity interval = max(70, 800 − (level−1)×70) ms; level = ⌊lines/10⌋+1.
- Scoring: clears 100/300/500/800 × level; soft +1/cell; hard +2/cell.
- Top-out detection at spawn collision (authentic — full rows clear before top-out
  can occur, so test seams block only the spawn columns).

## Testing

- [x] `npm run check` — 15/15 files OK
- [x] `node --test tests/game-06.test.mjs` — **12/12 green**
- [x] Full suite **78/78 green**

Coverage: idle well · spawn + next validity · wall blocking · kick rotation near
wall · soft-drop scoring + floor lock · hard-drop bonus + lock · row completion,
clear & payout · level-up gravity curve · authentic top-out via blocked spawn ·
pause toggle · touch pad actions · restart-from-game-over reset.

## Problems Encountered

1. First line-clear test rotated the I vertical and pushed it to the right wall —
   landed in wrong columns. Simplified to horizontal I spanning exactly the gap.
2. "Stack everything" approach can't force top-out: completed rows clear on the
   next lock. Replaced with spawn-column blocking (matches real gameplay).
3. Cross-realm grid arrays failed deepEqual → Array.from copies.

## Resolution

All resolved; documented patterns for remaining games.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green (78/78 total)
- [x] Docs updated (README/PROGRESS/EXECUTION)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-06): build block drop`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
