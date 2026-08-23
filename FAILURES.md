# FAILURES.md

Log of failures and resolutions. Format per template below.

```markdown
## Failure N: <title>
### Context
### Command
### Error
### Diagnosis
### Fix Attempt
### Result
### Prevention
```

---

## Failure 1: `npm test` fails with MODULE_NOT_FOUND when passing a directory

### Context

Sprint 1 close-out; first run of the full suite (`npm test`) after the per-game file passed.

### Command

```bash
npm test   # script was: node --test tests/
```

### Error

```
Error: Cannot find module '<repo>/tests'
code: 'MODULE_NOT_FOUND'
```

### Diagnosis

On this Node version (v26.7.0) with `type: commonjs`, the bare directory argument
to `--test` was resolved by the CJS loader as an entry module instead of being
treated as a test-directory discovery target.

### Fix Attempt

Changed the npm script to let the shell expand a glob:
`node --test tests/*.test.mjs`.

### Result

Full suite executes correctly; all suites run in one command.

### Prevention

Prefer explicit file globs for test runners in npm scripts; verify the full-suite
command immediately after wiring it (not only per-file invocations).

---

## Failure 2: jsdom provides no `localStorage` on `file://` origins

### Context

Sprint 2 — Memory Match best-time persistence assertions failed (`'—' !== '0s'`).

### Command

```bash
node --test tests/game-02.test.mjs
```

### Error

Best score lost after `reset()`; storage read returned fallback.

### Diagnosis

jsdom only implements `window.localStorage` for non-opaque origins. Test pages load
via `file://…`, which is opaque → `window.localStorage` is `undefined`. The games'
safe storage wrapper swallowed this silently (by design), so persistence never
happened anywhere — including potentially in constrained real-browser contexts.

### Fix Attempt

Added a Map-backed `localStorage`/`sessionStorage` polyfill to `tests/helpers.mjs`
before game scripts execute.

### Result

Persistence path now exercised realistically; assertions pass. Games unchanged
(their defensive wrapper remains correct).

### Prevention

Polyfill browser environment gaps explicitly in the harness; never assume silent
fallbacks equal real behavior.

---

## Failure 3: test process hangs after all tests pass (needed `--test-force-exit`)

### Context

Sprint 2 — first run of the memory-match suite timed out at 120s despite green tests.

### Command

```bash
node --test tests/game-02.test.mjs
```

### Error

No error output; process simply never exited (bash tool timeout).

### Diagnosis

`JSDOM` was constructed with `pretendToBeVisual: true`, which starts jsdom's
internal animation-frame clock. That clock keeps Node's event loop alive forever
after the suite completes.

### Fix Attempt

Removed `pretendToBeVisual` from `tests/helpers.mjs`; the harness already installs
its own `requestAnimationFrame` shim backed by plain timers.

### Result

Both suites exit cleanly on their own (~3.5s combined); no force-exit flag required.

### Prevention

Avoid `pretendToBeVisual` unless its full feature set is required; prefer explicit
shims whose lifetimes are under test control.


