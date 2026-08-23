# EXECUTION.md

Live execution state. Update at every sprint boundary so any agent can resume.

## Current state

- **Current phase:** Phase 1 → Sprint 0
- **Current sprint:** SPRINT-00-SETUP
- **Last completed sprint:** none (Phase 1 docs just written)
- **Next action:** git init, create GitHub repo, initial commit + push

## Environment snapshot

- macOS 26.5.1 · Node v26.7.0 · npm 11.19.0 · git 2.50.1 · gh 2.97.0
- gh authenticated as `sonalisrisivani` (repo scope) ✔
- No browser binary available → automated verification = node:test + jsdom

## Commands

- Test all games: `npm test`
- Syntax check all JS: `npm run check`
- Serve hub: `python3 -m http.server 8080`

## Git state

- **Remote:** (to be created in Sprint 0)
- **Branch:** main
- **Last commit:** —
- **Last push:** —

## Blockers

- None.

## Recovery instructions

1. Read `PROGRESS.md` → find first row not fully ✅.
2. Read that game's `sprints/SPRINT-XX-*.md`.
3. Re-run `npm test`; fix failures; continue the loop:
   implement → verify → document → update PROGRESS → commit → push.
