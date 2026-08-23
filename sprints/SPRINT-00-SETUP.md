# Sprint 0: SETUP

## Objective

Initialize repository, GitHub remote, hub page, shared design system, test harness, and CI-ready npm scripts.

## Tasks

- [x] `git init` (branch main) + `.gitignore`
- [x] `package.json` with `test` / `check` scripts, jsdom devDependency
- [x] `shared/styles.css` design system + `shared/common.js` helpers
- [x] Hub `index.html` listing all 10 games (cards update as games land)
- [x] Test harness `tests/helpers.mjs` + runner wiring (`node --test tests/`)
- [x] Install dev dependencies (jsdom, 0 vulnerabilities)
- [x] Create GitHub repo via `gh` and push initial commit

## Implementation Notes

- Harness loads each game's HTML into jsdom, evals its `<script src>` files in order,
  fires DOMContentLoaded, and stubs Canvas2D + requestAnimationFrame.
- Hub cards carry `data-status`; sprints flip them from "Coming soon" to ready.
- Design system: dark arcade theme, CSS custom props, `.btn/.card/.hud/.overlay` components.

## Testing

- [x] `npm run check` — 3/3 files OK
- [x] jsdom hub load: title OK, 10 cards present
- [x] `git push` verified (`gh repo view`)

## Problems Encountered

(None.)

## Resolution

(N/A.)

## Definition of Done

- [x] All tasks above checked
- [x] `npm run check` passes
- [x] Hub smoke check green
- [x] Docs updated (README/PROGRESS/EXECUTION)
- [ ] Committed with conventional message
- [ ] Pushed and verified on remote

## Git Commit

`c3b83fe` chore: project scaffolding, docs, shared UI system, test harness

## Git Push

Pushed to https://github.com/sonalisrisivani/browser-arcade-10 (verified via gh repo view)

## Status

COMPLETE
