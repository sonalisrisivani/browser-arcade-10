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

---

## Failure 4: games initialized twice under the test runner (double listeners)

### Context

Sprint 3 — Minesweeper flag-mode clicks appeared to "do nothing"; every toggle
reverted instantly. Only reproducible via `node --test`, not plain scripts.

### Command

```bash
node --test tests/game-03.test.mjs
```

### Error

Single button click produced *two* `toggleFlagMode` invocations (verified by
temporary instrumentation): state toggled true → false within one click.

### Diagnosis

jsdom fires its **native** `DOMContentLoaded` asynchronously after page parsing,
*i.e.*, after `loadPage()` had already returned and the harness had manually
dispatched a synthetic `DOMContentLoaded`. Result: each game's `init()` ran twice
→ two click listeners on every control.

### Fix Attempt

`loadPage()` is now async: it executes the game's scripts, then **awaits jsdom's
native DOMContentLoaded** instead of synthesizing one. All suites updated to
`beforeEach(async …) => { … = await loadPage(DIR) }`.

### Result

Exactly one init per page load across all suites; flag mode behaves correctly;
37/37 tests green with clean process exit. Also added an `afterEach` timer-cleanup
net so a failing assertion can no longer leak a running game interval (the
secondary hang cause).

### Prevention

Never synthesize lifecycle events that the environment also emits — await the
real ones. Instrument listener counts before blaming event logic.




---

## Failure 5: Memory Match cards invisible on the live site (inline span collapse)

### Context

Post-deployment user report: Memory Card Match board renders with no visible cards.

### Command

Manual inspection of `games/game-02-memory-match/style.css` + DOM structure.

### Error

No console error — purely a layout failure. Card cells occupy grid space but
paint nothing.

### Diagnosis

`.card-inner` is created as a `<span>` (inline element) and sized via
`width:100%; height:100%` — properties that **do not apply to inline
elements**. Its children (`.card-face`s) are absolutely positioned and
contribute no intrinsic size, so `.card-inner` collapses to 0×0 and both faces
(inset:0 within a zero box) render nothing.

The jsdom smoke tests verified state classes and click behavior, not computed
geometry, so the bug was invisible to the suite.

### Fix Attempt

Added `display: block;` to `.card-inner` so it fills the aspect-ratio-sized
button and gives the absolutely-positioned faces a real containing block.

### Result

Cards render face-down correctly; flip/match animations unaffected; all 12
game-02 tests still green.

### Prevention

Percentage sizing on generated markup requires block/flex/grid display. When
tests must stand in for a browser, add at least minimal geometry assertions
(offsetWidth/offsetHeight) for critical visual components.
