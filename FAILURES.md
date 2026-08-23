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

