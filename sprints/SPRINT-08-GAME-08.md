# Sprint 8: GAME-08 — Tic-Tac-Toe vs AI

## Objective

Implement, verify and ship `games/game-08-tictactoe` per GAME_PLAN.md Game 08 spec.

## Tasks

- [x] Scaffold `games/game-08-tictactoe/` (index.html, style.css, game.js, README.md)
- [x] Implement gameplay (minimax AI w/ difficulty noise, series scoreboard, alternating starter, 2-player mode)
- [x] Polish UI (big tappable cells, winning-line pulse, result overlay, status line)
- [x] Add hub card link (flipped to Playable)
- [x] Write smoke tests `tests/game-08.test.mjs`

## Implementation Notes

- Minimax is full-depth with O-perspective ±10/0 scoring; Easy/Medium inject 65%/35% random moves.
- Rounds alternate the starting player; the AI opens automatically when it starts.
- 2-player mode bypasses scheduling entirely.

## Testing

- [x] `npm run check` — 19/19 files OK
- [x] `node --test tests/game-08.test.mjs` — **11/11 green**
- [x] Full suite **101/101 green**

Coverage: initial render · move registration + scheduled AI reply · X win detection +
line highlight · AI win + series update · forced draw · **Hard-AI optimality verified
exhaustively against an independent reference solver across all 9 openers** · easy-mode
randomness · occupied-square rejection · next-round starter flip + series reset ·
2-player mode (no auto-AI) · difficulty switching.

## Problems Encountered

1. Test harness click wrapper missing window arg (recurring pitfall — fixed like Sprint 1).
2. My first exhaustive-checker skipped O's reply to the opener and misread sign
   conventions; rewrote it as an independent reference solver that *plays full games*
   against the real hard AI through the public API.
3. Rewritten test initially forgot to enable Hard mode → Medium's randomness failed it;
   restored before shipping.

## Resolution

All resolved. The exhaustive oracle test now provides a strong guarantee: the hard
AI provably never loses from any opener against best play.

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] `npm test` green (101/101 total)
- [x] Docs updated (README/PROGRESS/EXECUTION)
- [x] Committed with conventional message
- [x] Pushed and verified on remote

## Git Commit

`feat(game-08): build tic-tac-toe vs ai`

## Git Push

Pushed to origin/main and verified.

## Status

COMPLETE
