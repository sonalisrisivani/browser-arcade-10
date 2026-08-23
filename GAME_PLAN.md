# GAME_PLAN.md

Ten genuinely different games covering distinct UI/interaction patterns: canvas game
loops, DOM grids, flip animations, swipe gestures, physics collisions, AI opponents,
typing metrics and audio sequencing. No two games share a core mechanic.

---

## Game 01 — Neon Snake

- **Folder:** `games/game-01-snake`
- **Objective:** Grow the snake by eating food without hitting walls or yourself.
- **Core gameplay:** Tick-based movement on a 21×21 canvas grid; food spawns on free cells; snake grows on eat; speed increases every 5 foods.
- **Controls:** Arrow keys / WASD steer; Space or button pause/resume; Enter/click start & restart; on-screen d-pad for touch.
- **Game states:** `idle → running ⇄ paused → game-over → restart`.
- **UI requirements:** Canvas board, score + best (localStorage), level indicator, overlay screens (start/pause/over), touch d-pad.
- **Difficulty:** Speed steps up every 5 foods.
- **Scoring:** 10 × level per food; best persisted.
- **Win condition:** None (endless).
- **Loss condition:** Head hits wall or body.
- **Restart behavior:** Full reset of grid/score/speed from overlay button or Enter.
- **Responsive:** Canvas scales to container; d-pad shown on coarse pointers.
- **Testing:** Load page, start, simulate arrow keys, assert movement/score, force collision → game-over overlay, restart resets state.
- **Definition of done:** All verified via smoke test, no console errors, committed + pushed.

## Game 02 — Memory Card Match

- **Folder:** `games/game-02-memory-match`
- **Objective:** Match all pairs of emoji cards in fewest moves/time.
- **Core gameplay:** 4×4 face-down cards; flip two per turn; match stays revealed; mismatch flips back after delay; 8 pairs.
- **Controls:** Mouse/tap cards; difficulty + restart buttons.
- **Game states:** `idle → playing → won`.
- **UI requirements:** CSS flip animation, moves counter, timer, star rating, win modal, 4×4/6×6 difficulty toggle.
- **Difficulty:** 4×4 (8 pairs) or 6×6 (18 pairs).
- **Scoring:** Moves count; star rating by efficiency.
- **Win condition:** All pairs matched.
- **Loss condition:** None.
- **Restart behavior:** Reshuffle deck, reset counters/timer.
- **Responsive:** Cards size via CSS grid + clamp(); works at 360px.
- **Testing:** Flip cards programmatically; match persists; mismatch re-hides; win modal shows; restart reshuffles.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 03 — Minesweeper Classic

- **Folder:** `games/game-03-minesweeper`
- **Objective:** Reveal all safe cells; flag mines.
- **Core gameplay:** Beginner 9×9/10 mines, Intermediate 16×16/40; first click always safe (mines placed after first reveal); flood-fill reveal of zero regions; numbers = adjacent mines.
- **Controls:** Click/tap reveal; right-click or long-press flag; flag-mode toggle for mobile; face button resets.
- **Game states:** `idle → playing → won | lost`.
- **UI requirements:** Mine counter, timer, face status button, cell states, color-coded numbers, result banner.
- **Difficulty:** Beginner/Intermediate selector.
- **Scoring:** Time to win; best persisted per difficulty.
- **Win condition:** All safe cells revealed.
- **Loss condition:** Revealing a mine.
- **Restart behavior:** New board same settings, instant.
- **Responsive:** Cell size clamps; long-press flags on touch.
- **Testing:** Deterministic seeded board; reveal/flood-fill correctness; flag toggle; loss on mine; win when all safe revealed; timer runs.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 04 — 2048 Merge

- **Folder:** `games/game-04-2048`
- **Objective:** Slide numbered tiles to merge them; reach 2048.
- **Core gameplay:** 4×4 grid; arrows/swipe slide all tiles; equal tiles merge once per move; new tile (2 or 4) spawns each move; over when no moves remain.
- **Controls:** Arrow keys/WASD; touch swipe; New Game + Undo buttons.
- **Game states:** `idle → playing → won (keep playing) | over`.
- **UI requirements:** Tile colors by value, score + best (localStorage), one-step undo, win/over overlay, swipe hint.
- **Difficulty:** Inherent progression.
- **Scoring:** Sum of merged values; best persisted.
- **Win condition:** 2048 tile exists (may continue).
- **Loss condition:** Grid full, no merges possible.
- **Restart behavior:** Fresh board with two tiles; undo history cleared.
- **Responsive:** Board scales; swipe on touch; keys on desktop.
- **Testing:** Inject known board; simulate moves; assert merge math, spawn, game-over detection, undo restores, restart clears.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 05 — Brick Breaker

- **Folder:** `games/game-05-breakout`
- **Objective:** Destroy all bricks with a ball bounced off a paddle.
- **Core gameplay:** Canvas loop; paddle follows mouse/touch/keys; ball bounces off walls/paddle/bricks; bounce angle depends on paddle hit position; 3 lives; 3 levels; speed ramps per level.
- **Controls:** Mouse/touch paddle; ←/→ keys; Space launch/pause; click to launch.
- **Game states:** `idle → ready → playing ⇄ paused → level-clear → game-over | victory`.
- **UI requirements:** Score/lives/level HUD, tiered brick colors, overlays, launch hint.
- **Difficulty:** Levels add rows/speed; ball accelerates within level.
- **Scoring:** Bricks worth by row; combo bonus between paddle hits.
- **Win condition:** Clear all levels.
- **Loss condition:** Lose all lives.
- **Restart behavior:** Resets score/lives/level.
- **Responsive:** Canvas letterboxes to width; drag anywhere moves paddle.
- **Testing:** Stub canvas; launch; force brick collision → score up; ball past floor → life lost; last brick → level clear; 0 lives → game over.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 06 — Block Drop (Tetris-style)

- **Folder:** `games/game-06-block-drop`
- **Objective:** Clear lines by filling rows with falling tetrominoes.
- **Core gameplay:** 10×20 well; 7 shapes with rotation + wall kicks; soft/hard drop; line-clear scoring 100/300/500/800 × level; level per 10 lines speeds gravity; next-piece preview; ghost piece.
- **Controls:** ←/→ move, ↓ soft drop, ↑/X rotate CW, Z rotate CCW, Space hard drop, P pause; touch button row.
- **Game states:** `idle → playing ⇄ paused → game-over`.
- **UI requirements:** Well canvas + preview canvas, score/lines/level HUD, overlays, key legend.
- **Difficulty:** Gravity table per level.
- **Scoring:** Line clears + soft/hard drop points; best persisted.
- **Win condition:** None (endless).
- **Loss condition:** Spawn blocked (top-out).
- **Restart behavior:** Empties well, resets counters.
- **Responsive:** Scales down; mobile control buttons.
- **Testing:** Spawn/move/rotate with kicks; lock piece; seed full line → clear + score; top-out detection; restart resets.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 07 — Flappy Glide

- **Folder:** `games/game-07-flappy-glide`
- **Objective:** Fly through pipe gaps by tapping.
- **Core gameplay:** rAF physics: gravity + flap impulse; pipe spawner with randomized gaps; circle-rect collision; score per pipe passed; ground/wall death.
- **Controls:** Space/click/tap flap; P pause; R restart.
- **Game states:** `idle → playing ⇄ paused → game-over`.
- **UI requirements:** Parallax background, bird rotation by velocity, medal thresholds (10/25/50), best score, overlays.
- **Difficulty:** Gap narrows and speed rises with score.
- **Scoring:** 1 per pipe; medals at thresholds.
- **Win condition:** None (endless).
- **Loss condition:** Pipe/ground/ceiling collision.
- **Restart behavior:** Instant from overlay or R.
- **Responsive:** Canvas resizes; tap anywhere.
- **Testing:** Start; flap changes velocity; pipes spawn/move; forced collision → overlay; score increments; restart resets.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 08 — Tic-Tac-Toe vs AI

- **Folder:** `games/game-08-tictactoe`
- **Objective:** Beat an AI across three difficulties.
- **Core gameplay:** 3×3 board; player X vs AI O; minimax AI with randomness for Easy/Medium; Hard is perfect (unbeatable); optional local 2-player mode.
- **Controls:** Click/tap cells; difficulty select; New Round; mode toggle.
- **Game states:** `idle → playing → x-wins | o-wins | draw`.
- **UI requirements:** Big tappable cells, animated X/O marks, turn indicator, series scoreboard (W/L/D), winning-line highlight, result banner.
- **Difficulty:** Easy (60% random), Medium (mix), Hard (perfect minimax).
- **Scoring:** Series tally persisted in-session.
- **Win condition:** Three in a row.
- **Loss condition:** AI gets three in a row; draws possible vs Hard.
- **Restart behavior:** New round alternates starter.
- **Responsive:** Board scales to min(vw,vh); fully tappable.
- **Testing:** Moves register; AI responds; Hard never loses across full simulation; win/draw detection; scoreboard updates; reset works.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 09 — Type Storm

- **Folder:** `games/game-09-type-storm`
- **Objective:** Type falling words before they reach the bottom.
- **Core gameplay:** Words fall at increasing rate; typing a word fully destroys it (+points by length); missed words cost lives (3); live WPM + accuracy stats; ~200 common words list.
- **Controls:** Keyboard only (hidden input for mobile focus); Start/Pause buttons.
- **Game states:** `idle → countdown → playing ⇄ paused → game-over`.
- **UI requirements:** Word field (DOM), typed-prefix highlight, lives display, WPM/accuracy panel, level indicator, overlays.
- **Difficulty:** Fall speed/spawn rate rise every 10 words destroyed.
- **Scoring:** Points by word length × level; streak multiplier.
- **Win condition:** None (endless survival).
- **Loss condition:** 3 words reach bottom.
- **Restart behavior:** Resets field/lives/stats.
- **Responsive:** Layout stacks on mobile; hidden input captures soft keyboard.
- **Testing:** Start; type word chars → word removed + score up; word reaching floor → life lost; 0 lives → game-over; stats update; restart resets.
- **Definition of done:** Verified via smoke test, committed + pushed.

## Game 10 — Simon Says (Repeat the Signal)

- **Folder:** `games/game-10-simon`
- **Objective:** Repeat ever-growing color/sound sequences.
- **Core gameplay:** Sequence grows by one each round; playback then input phase; WebAudio tones per pad (mute available); playback speed increases slightly.
- **Controls:** Click/tap pads during input; any-key/button start; Strict mode toggle.
- **Game states:** `idle → showing → input → success → next round | fail → game-over`.
- **UI requirements:** Four large pads with lit states, round counter, status text, start/restart, strict toggle, mute toggle.
- **Difficulty:** Unlimited length; strict ends game on mistake (normal replays sequence).
- **Scoring:** Round reached = score; best persisted.
- **Win condition:** None (endless).
- **Loss condition:** Wrong pad in strict mode.
- **Restart behavior:** Fresh sequence, round 1.
- **Responsive:** Pads reflow to 2×2 grid that scales; fully tappable.
- **Testing:** Start → sequence shown (lit classes); correct input advances round; wrong input fails per mode; audio stubbed in tests; restart resets.
- **Definition of done:** Verified via smoke test, committed + pushed.
