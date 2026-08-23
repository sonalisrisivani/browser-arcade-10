# PROMPT.md

> **This file contains the single prompt that produced the entire repository** —
> from creating the GitHub repo, through planning, building and testing all 10
> games, to deploying the site to GitHub Pages. It is reproduced verbatim below.

---

# Autonomous 10-Game UI Project Execution

You are operating as an autonomous senior software engineer and project execution agent inside this repository/workspace.

Your task is to independently plan, implement, test, document, commit, and push **10 separate UI-based browser games**, with minimal human intervention.

You have permission to use the terminal and any available CLI tools/commands necessary to complete the task.

## PRIMARY OBJECTIVE

Create a GitHub repository for this project and build **10 different polished browser games**, where:

* Each game lives in its own folder.
* Each game is independently runnable.
* Each game has a polished UI.
* Each game is actually playable.
* Each game has clear instructions.
* Each game is tested before being considered complete.
* Every completed game is committed and pushed to GitHub.
* The entire execution is tracked through Markdown files.
* The project should be structured so another agent can understand exactly what has been completed, what is currently running, and what remains.
* You must continue automatically from one game/sprint to the next without waiting for me.

The goal is to test your ability to execute a long-running multi-step engineering task autonomously.

---

# IMPORTANT AUTONOMY RULE

Do NOT stop after creating a plan.

Do NOT ask me to approve each game.

Do NOT wait for confirmation between sprints.

Do NOT return control to me after each game.

Once you begin, continue executing the entire workflow until all 10 games are implemented, tested, documented, committed, and pushed.

Only stop if you encounter a genuinely unrecoverable blocker that prevents further execution.

If something fails:

1. Diagnose the failure.
2. Attempt a reasonable fix.
3. Retry.
4. If the failure is related to one game, isolate it and continue with the remaining work where possible.
5. Record the failure and resolution in the project documentation.

---

# PHASE 0 — INSPECT ENVIRONMENT

Before doing anything:

1. Inspect the current directory.
2. Inspect available files.
3. Check whether Git is installed.
4. Check whether GitHub CLI (`gh`) is installed.
5. Check whether Node.js/npm/pnpm/bun/etc. are available.
6. Determine the most appropriate lightweight frontend stack.
7. Prefer a simple stack that is easy to run and maintain.

Do not unnecessarily introduce complicated infrastructure.

Before implementing the games, determine the best project architecture.

---

# PHASE 1 — CREATE PROJECT MANAGEMENT STRUCTURE FIRST

Before building any game, create a structured project-management system.

At minimum create:

```text
README.md

PROJECT.md
GAME_PLAN.md
ARCHITECTURE.md
EXECUTION.md
PROGRESS.md
DECISIONS.md
FAILURES.md

sprints/
  SPRINT-00-SETUP.md
  SPRINT-01-GAME-01.md
  SPRINT-02-GAME-02.md
  SPRINT-03-GAME-03.md
  SPRINT-04-GAME-04.md
  SPRINT-05-GAME-05.md
  SPRINT-06-GAME-06.md
  SPRINT-07-GAME-07.md
  SPRINT-08-GAME-08.md
  SPRINT-09-GAME-09.md
  SPRINT-10-GAME-10.md
  SPRINT-11-FINAL.md
```

You may add additional files if useful.

---

# GAME PLAN

Create a detailed `GAME_PLAN.md`.

Select 10 genuinely different games.

Do NOT create 10 trivial variations of the same game.

Choose games that demonstrate different UI and interaction patterns.

For example, you may choose games such as:

1. Snake
2. Memory Card Match
3. Minesweeper
4. 2048
5. Breakout
6. Tetris-style block game
7. Flappy-style game
8. Tic-Tac-Toe
9. Word/typing game
10. Simon-style memory game

You may replace these with better choices if you believe another selection provides better engineering/UI coverage.

For every game define:

* Name
* Objective
* Core gameplay
* Controls
* Game states
* UI requirements
* Difficulty/progression
* Scoring
* Win condition
* Loss condition
* Restart behavior
* Responsive behavior
* Testing requirements
* Definition of done

---

# PROJECT ARCHITECTURE

Create a clear architecture.

Prefer something similar to:

```text
/
├── README.md
├── PROJECT.md
├── GAME_PLAN.md
├── ARCHITECTURE.md
├── EXECUTION.md
├── PROGRESS.md
├── DECISIONS.md
├── FAILURES.md
│
├── sprints/
│   ├── SPRINT-00-SETUP.md
│   ├── SPRINT-01-GAME-01.md
│   ├── ...
│   └── SPRINT-11-FINAL.md
│
├── games/
│   ├── game-01/
│   ├── game-02/
│   ├── game-03/
│   ├── game-04/
│   ├── game-05/
│   ├── game-06/
│   ├── game-07/
│   ├── game-08/
│   ├── game-09/
│   └── game-10/
│
└── ...
```

Each game should be isolated enough that it is easy to understand and modify.

---

# SPRINT SYSTEM

Treat the entire project as a sequence of autonomous sprints.

Each sprint file must contain:

```markdown
# Sprint X

## Objective

## Tasks

- [ ] ...

## Implementation Notes

## Testing

- [ ] ...

## Problems Encountered

## Resolution

## Definition of Done

- [ ] ...

## Git Commit

## Git Push

## Status
```

At the beginning of every sprint:

1. Read the sprint file.
2. Read `PROGRESS.md`.
3. Read any relevant previous documentation.
4. Execute the sprint.
5. Update the sprint file.
6. Update `PROGRESS.md`.
7. Commit changes.
8. Push changes.
9. Only then begin the next sprint.

---

# GIT/GITHUB REQUIREMENTS

This is extremely important.

You must manage Git automatically.

First inspect whether the current directory is already a Git repository.

If it is not:

1. Initialize Git.
2. Create the initial project structure.
3. Create an initial commit.

Then determine whether a GitHub remote/repository exists.

If GitHub CLI is available and authentication is already configured:

* Create a GitHub repository automatically using `gh`.
* Use a sensible repository name.
* Add the GitHub remote.
* Push the initial branch.

If authentication or repository creation cannot be performed automatically, diagnose the issue.

Do NOT fabricate successful pushes.

---

# COMMIT/PUSH POLICY

After EVERY completed game:

1. Run relevant tests/checks.
2. Update documentation.
3. Update `PROGRESS.md`.
4. Update the corresponding sprint file.
5. Check `git status`.
6. Review the diff.
7. Create a meaningful commit.

Example:

```text
feat(game-01): build snake game
```

Then push immediately:

```bash
git push
```

Do not accumulate all 10 games and push only at the end.

There should be a clear Git history showing the progression of the project.

Also commit/push important project-management milestones when appropriate.

---

# GAME IMPLEMENTATION REQUIREMENTS

Every game must be more than a placeholder.

Each game should include:

### Functionality

* Working game loop where applicable
* Correct state management
* Score system where appropriate
* Start/restart functionality
* Win/loss states
* Keyboard controls where appropriate
* Mouse/touch interaction where appropriate
* Difficulty/progression where appropriate

### UI

Create a polished modern interface.

Each game should have:

* Game title
* Clear visual hierarchy
* Score/status area
* Start/restart controls
* Instructions
* Game area
* Feedback for win/loss/game-over states
* Responsive layout
* Good spacing
* Consistent typography
* Accessible buttons
* Hover/focus states
* Sensible mobile behavior

Avoid making the games look like bare programming exercises.

---

# SHARED UI SYSTEM

If appropriate, create a small shared design system for:

* Buttons
* Cards
* Typography
* Game headers
* Score displays
* Modals
* Game-over screens
* Navigation

However, do NOT over-engineer.

The objective is to create 10 good games, not a giant framework.

---

# TESTING REQUIREMENTS

After each game:

1. Run the project's available lint/type-check/test commands.
2. Start the development server if appropriate.
3. Verify the game actually loads.
4. Verify important interactions.
5. Check for console/runtime errors if browser tooling is available.
6. Fix discovered issues.
7. Repeat verification after fixes.

If browser automation or screenshot tooling is available, use it.

At minimum verify:

* Page loads.
* Game starts.
* Main interaction works.
* Restart works.
* Game state transitions work.
* No obvious runtime errors.
* UI is not broken on common viewport sizes.

Document what was tested.

---

# BROWSER VERIFICATION

If browser automation tools are available, use them.

For every game:

1. Launch the application.
2. Open the game.
3. Verify the main UI.
4. Perform representative interactions.
5. Check for errors.
6. Verify restart/reset.
7. Take screenshots if useful.
8. Record verification results.

Do not claim browser verification occurred unless you actually performed it.

---

# PROGRESS TRACKING

Maintain `PROGRESS.md`.

Use a table similar to:

```markdown
| # | Game | Planning | Implementation | Testing | Committed | Pushed | Status |
|---|------|----------|----------------|---------|-----------|--------|--------|
| 1 | ...  | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 2 | ...  | ✅ | 🚧 | ⬜ | ⬜ | ⬜ | In Progress |
...
```

Update this file after meaningful milestones.

This file is the source of truth for project progress.

---

# EXECUTION STATE

Maintain `EXECUTION.md`.

It should contain:

* Current sprint
* Current game
* Last completed sprint
* Next sprint
* Current blockers
* Last successful command
* Last Git commit
* Last Git push
* Recovery instructions

This allows the workflow to recover if the agent/session is interrupted.

---

# FAILURE HANDLING

Maintain `FAILURES.md`.

Whenever something fails, record:

```markdown
## Failure

### Context

### Command

### Error

### Diagnosis

### Fix Attempt

### Result

### Prevention
```

Do not repeatedly run the same failed command without changing your approach.

---

# DECISION LOG

Maintain `DECISIONS.md`.

Record important engineering decisions such as:

* Why a framework was selected
* Why a particular architecture was selected
* Why a game implementation uses a certain approach
* Significant dependency decisions
* Testing decisions
* Changes to the original plan

Keep this concise.

---

# README

Create a polished `README.md` that explains:

* What the project is
* The 10 games
* Technology used
* Project structure
* How to run locally
* How to run tests
* Game descriptions
* Development progress
* Git workflow
* Future improvements

Update it as necessary after the games are completed.

---

# AUTONOMOUS EXECUTION LOOP

Use this exact mental execution loop:

```text
READ STATE
    ↓
READ CURRENT SPRINT
    ↓
IMPLEMENT
    ↓
RUN CHECKS
    ↓
VERIFY
    ↓
FIX PROBLEMS
    ↓
DOCUMENT
    ↓
UPDATE PROGRESS
    ↓
GIT STATUS
    ↓
GIT DIFF
    ↓
COMMIT
    ↓
PUSH
    ↓
VERIFY PUSH
    ↓
MARK SPRINT COMPLETE
    ↓
LOAD NEXT SPRINT
    ↓
REPEAT
```

Do not skip directly from implementation to the next game.

Every game must pass through the complete loop.

---

# IMPORTANT: ACTUAL EXECUTION

Do not merely create Markdown files describing what should happen.

Actually perform the work.

Use terminal commands.

Create directories.

Create files.

Write code.

Install dependencies if necessary.

Run commands.

Run tests.

Start servers where appropriate.

Inspect errors.

Fix errors.

Initialize Git.

Create the GitHub repository.

Commit.

Push.

Verify.

Continue.

The final repository should contain the actual working implementation of all 10 games, not merely plans or placeholders.

---

# QUALITY BAR

Before considering a game complete, ask yourself:

> "If someone cloned this repository and opened this game, would it feel like a real small browser game rather than an AI-generated demo?"

If the answer is no, improve it.

Prioritize:

1. Functionality
2. Usability
3. Visual polish
4. Responsive behavior
5. Code quality
6. Testing
7. Documentation

Do not spend excessive time making architecture perfect.

---

# RESOURCE MANAGEMENT

Because this is a long-running autonomous task:

* Avoid unnecessary dependencies.
* Reuse useful components.
* Avoid rebuilding the same infrastructure repeatedly.
* Keep implementations reasonably small.
* Prefer simple reliable solutions.
* Do not spend the majority of time polishing one game while nine remain unfinished.

If a game becomes unexpectedly difficult, implement a simpler but complete version rather than getting permanently stuck.

---

# FINAL SPRINT

After all 10 games are complete:

Run a final audit.

Check:

```text
[ ] All 10 game folders exist
[ ] All 10 games load
[ ] All 10 games are playable
[ ] All 10 games have polished UI
[ ] All 10 games have instructions
[ ] All 10 games have restart functionality
[ ] All relevant tests/checks pass
[ ] Documentation is complete
[ ] PROGRESS.md shows all games complete
[ ] Git history contains the game commits
[ ] All commits are pushed
[ ] Git working tree is clean
[ ] GitHub repository contains the final state
```

Create/update:

```text
sprints/SPRINT-11-FINAL.md
```

Document the final result.

Then push the final documentation changes.

---

# FINAL RESPONSE

Only after the entire workflow has been completed, provide a concise final report containing:

* Repository name
* Repository URL if available
* Technology used
* List of all 10 games
* Number of commits created
* Final Git status
* Testing status
* Any unresolved issues

Do not claim anything was completed unless you actually verified it.

---

# START NOW

Begin with environment inspection.

Then execute Phase 0 → Phase 1 → Sprint 0 → Sprint 1 → ... → Sprint 11.

Do not wait for additional instructions.

Your objective is to finish the entire repository and leave the final working state pushed to GitHub.
