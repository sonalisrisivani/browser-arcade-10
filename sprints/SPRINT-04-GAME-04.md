# Sprint 4: GAME-04 — 2048 Merge

## Objective

Implement, verify and ship `games/game-04-2048` per GAME_PLAN.md Game 04 spec.

## Tasks

- [x] Scaffold `games/game-04-2048/` (index.html, style.css, game.js, README.md)
- [x] Implement gameplay (slide/merge algorithm, spawns, undo, win/over detection)
- [x] Polish UI (value-colored tiles, pop/merge animations, overlays, swipe support)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-04.test.mjs`

## Implementation Notes

- Move algorithm is line-based: compact + single merge per tile pair, no chains.
- Tiles are persistent DOM nodes keyed by id; movement = CSS transform transitions;
  merges double the survivor's value via a post-move merge list (no mid-compute mutation).
- One-step undo snapshots tiles+score before every successful move; consumed on use.
- Best score updates immediately whenever exceeded (not only on game end).
- Win overlay at first 2048; "Keep Going" continues with no re-trigger.

## Testing

- [x] `npm run check` — 11/11 files OK
- [x] `node --test tests/game-04.test.mjs` — **16/16 green**
- [x] Full suite **53/53 green across 4 consecutive runs** (flake-hardened)

Coverage: start overlay → play · pair merge math · no-chain merging · dual-pair
merging · rejected no-op moves · exact spawn count · edge compaction · undo
restore/consumption · keyboard input · dead-board detection + overlay ·
near-dead board stays playable · win overlay + continue semantics · retry reset ·
best-score persistence · mid-game restart.

## Problems Encountered

1. Cross-realm arrays from jsdom failed `deepStrictEqual` — Node-realm copies via
   `Array.from` (same as Sprint 1).
2. **Real bug:** computeMove mutated live tile values before the undo snapshot was
   taken → undo restored corrupted board. Fixed by deferring value doubling to
   applyMove through a merges list.
3. Best score was only persisted on win/over — now saved on every exceeding move.
4. Spawn randomness made three tests position-flaky; pinned Math.random per test
   for deterministic placement/value.

## Resolution

All fixed; suite verified stable over repeated runs. No open issues.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green (53/53 total, stable ×4)
- [x] Docs updated (README/PROGRESS/EXECUTION)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-04): build 2048 merge`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
