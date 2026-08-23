# EXECUTION.md

Live execution state. Update at every sprint boundary so any agent can resume.

## Current state

- **Current phase:** Sprint 7 — Game 07 Flappy Glide
- **Current sprint:** SPRINT-07-GAME-07
- **Last completed sprint:** Sprint 6 — Block Drop (12/12 tests green; suite total 78)
- **Next action:** implement games/game-07-flappy-glide + tests, commit, push

## Environment snapshot

- macOS 26.5.1 · Node v26.7.0 · npm 11.19.0 · git 2.50.1 · gh 2.97.0
- gh authenticated as `sonalisrisivani` (repo scope) ✔
- No browser binary available → automated verification = node:test + jsdom

## Commands

- Test all games: `npm test`
- Syntax check all JS: `npm run check`
- Serve hub: `python3 -m http.server 8080`

## Git state

- **Remote:** https://github.com/sonalisrisivani/browser-arcade-10
- **Branch:** main
- **Last commit:** c3b83fe chore: project scaffolding
- **Last push:** 2026-08-23T10:20:04Z (verified)

## Blockers

- None.

## Recovery instructions

1. Read `PROGRESS.md` → find first row not fully ✅.
2. Read that game's `sprints/SPRINT-XX-*.md`.
3. Re-run `npm test`; fix failures; continue the loop:
   implement → verify → document → update PROGRESS → commit → push.
