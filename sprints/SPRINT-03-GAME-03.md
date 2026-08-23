# Sprint 3: GAME-03 — Minesweeper Classic

## Objective

Implement, verify and ship `games/game-03-minesweeper` per GAME_PLAN.md Game 03 spec.

## Tasks

- [x] Scaffold `games/game-03-minesweeper/` (index.html, style.css, game.js, README.md)
- [x] Implement gameplay (safe first click, flood fill, flags, win/loss detection, timer)
- [x] Polish UI (cell states, color-coded numbers, banner, face button, flag mode, long-press)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-03.test.mjs`

## Implementation Notes

- Beginner 9×9/10 mines; Intermediate 16×16/40. First click mines placed after reveal,
  excluding the clicked cell.
- `_debug.seedMines(indices)` queues a deterministic layout consumed by the next
  first-reveal — production randomness untouched.
- Long-press (450ms) plants a flag on touch; right-click on desktop; Flag-mode toggle
  reroutes taps for mobile.

## Testing

- [x] `npm run check` — all files OK
- [x] `node --test tests/game-03.test.mjs` — **10/10 green**
- [x] Full suite: **37/37 green**, clean process exit (no force-exit)

Coverage: board build · safe-first-click + timer start · flood-fill region/frontier ·
win path (banner, best time, face) · loss path (all mines revealed, exploded cell) ·
API/contextmenu flagging · flagged-cell reveal rejection · flag-mode rerouting ·
long-press vs quick tap · intermediate difficulty switch · mid-game restart.

## Problems Encountered

1. **Double init under node:test** — jsdom fires native DOMContentLoaded async after
   loadPage returned; the harness's synthetic dispatch caused two inits → every
   control had two listeners (toggles reverted instantly). Root-caused via temporary
   instrumentation; fixed by awaiting the native event (`Failure 4`).
2. Failing assertion skipped a test's cleanup → leaked game interval kept the event
   loop alive (hang). Added afterEach reset net.

## Resolution

Both fixed at root; documented in FAILURES.md #4. Harness is now strictly
environment-faithful: no synthetic lifecycle events anywhere.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green (37/37 total)
- [x] Docs updated (README/PROGRESS/EXECUTION/FAILURES)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-03): build minesweeper classic`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
