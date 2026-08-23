# PROJECT.md — Browser Arcade: 10 Games

## Mission

Build, test, document, commit and push **10 polished, independently playable browser games** in one repository, executed autonomously as a sequence of sprints.

## Goals

1. Each game lives in its own folder under `games/` and runs standalone (double-click `index.html`, no build step).
2. Every game has a polished UI: title screen, score/status area, instructions, start/restart controls, win/lose feedback, responsive layout.
3. Every game is verified by automated smoke tests (`npm test`) before being declared complete.
4. Every completed game is committed and pushed immediately — one sprint = one game = at least one commit + push.
5. The whole execution is tracked in Markdown so any agent or human can resume at any point.

## Source of truth

| Question | File |
|---|---|
| What is the plan? | `GAME_PLAN.md` |
| How is it built? | `ARCHITECTURE.md` |
| What is done? | `PROGRESS.md` |
| What is running right now? | `EXECUTION.md` |
| Why were choices made? | `DECISIONS.md` |
| What went wrong? | `FAILURES.md` |
| Per-sprint detail | `sprints/SPRINT-XX-*.md` |

## Constraints

- Minimal dependencies: vanilla JS/CSS; jsdom only for tests.
- No frameworks, no bundlers, no TypeScript.
- Games must work over `file://` (no ES modules in game code).
- Prefer simple reliable solutions over perfect ones.

## Success criteria

- 10 game folders, each loadable and playable.
- `npm test` green for all 10 games.
- Clean git history with per-game commits, all pushed to GitHub.
- Documentation reflects the true final state.
