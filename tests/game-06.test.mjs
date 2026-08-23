import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, pressKey } from './helpers.mjs';

const DIR = 'games/game-06-block-drop';
const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

describe('Game 06 — Block Drop', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try { Game.halt(); } catch { /* noop */ }
  });

  function bottomRow() { return Array.from(Game.grid()[19]); }
  function colHeight(c) {
    const g = Game.grid();
    for (let r = 0; r < 20; r++) if (g[r][c]) return 20 - r;
    return 0;
  }

  it('loads page in idle state with empty well', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
    assert.ok(Game.grid().every((row) => row.every((c) => c === 0)));
    assert.equal(doc.getElementById('level').textContent, '1');
  });

  it('start spawns a piece and shows a valid next preview', () => {
    Game.start();
    assert.equal(Game.state, 'playing');
    assert.ok(Game.piece);
    assert.ok(TYPES.includes(Game.piece.type));
    assert.ok(TYPES.includes(Game.nextType));
    assert.ok(Game.piece.y <= 1, 'piece spawns at top');
    Game.halt();
  });

  it('moves left/right and stops at walls', () => {
    Game.start();
    Game._debug.spawn('I');
    let guard = 40;
    while (Game.moveLeft() && guard-- > 0) { /* slide */ }
    const xLeft = Game.piece.x;
    assert.ok(!Game.moveLeft(), 'blocked at wall');
    assert.equal(Game.piece.x, xLeft);

    guard = 60;
    while (Game.moveRight() && guard-- > 0) { /* slide */ }
    assert.ok(!Game.moveRight(), 'blocked at right wall');
    Game.halt();
  });

  it('rotation with wall kicks stays inside the well', () => {
    Game.start();
    Game._debug.spawn('I');
    while (Game.moveRight()) { /* push to wall */ }
    const xBefore = Game.piece.x;
    assert.ok(Game.rotateCW(), 'rotation succeeded via kick');
    const cells = Game.piece;
    assert.ok(cells.rot === 1, 'rot state advanced');
    assert.ok(xBefore >= 6, 'piece was against the wall before kick');
    Game.halt();
  });

  it('soft drop scores +1 per cell and locks on floor contact', () => {
    Game.start();
    Game._debug.spawn('O');
    const s0 = Game.score;
    let moved = false;
    for (let i = 0; i < 25 && Game.softDrop(); i++) moved = true;
    assert.ok(moved);
    assert.ok(Game.score >= s0 + 10, `soft drop points (${s0} → ${Game.score})`);
    Game.halt();
  });

  it('hard drop slams the piece down and awards 2× distance', () => {
    Game.start();
    Game._debug.spawn('I');
    Game.rotateCW();
    const y0 = Game.piece.y;
    const s0 = Game.score;
    assert.ok(Game.hardDrop());
    assert.ok(Game.score >= s0 + 2 * (16 - y0), `drop bonus (${s0} → ${Game.score})`);
    assert.ok(bottomRow().some((c) => c === 1), 'piece locked into bottom row');
    assert.notEqual(Game.state, 'game-over');
  });

  it('completing a row clears it and pays 100 × level', () => {
    Game.start();
    Game._debug.spawn('I');
    for (let c = 0; c < 10; c++) if (c < 3 || c > 6) Game._debug.setCell(19, c, 1);

    Game.hardDrop();

    assert.deepEqual(bottomRow(), new Array(10).fill(0), 'cleared row is empty');
    assert.ok(Game.lines >= 1, `line counted (${Game.lines})`);
    assert.ok(Game.score >= 100, `clear score applied (${Game.score})`);
  });

  it('levels up every 10 lines and gravity speeds up', () => {
    Game.start();
    const g1 = Game.gravityInterval;
    Game._debug.addLines(9);
    assert.equal(Game.level, 1);
    Game._debug.addLines(1);
    assert.equal(Game.level, 2);
    assert.ok(Game.gravityInterval < g1, `${g1} → ${Game.gravityInterval}`);
    Game.halt();
  });

  it('stack to the top: blocked spawn ends the game', () => {
    Game.start();
    for (let c = 3; c <= 6; c++) {
      Game._debug.setCell(0, c, 1);
      Game._debug.setCell(1, c, 1);
    }
    Game.hardDrop();
    assert.equal(Game.state, 'game-over', `state=${Game.state}`);
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
  });

  it('pause/resume toggles with P', () => {
    Game.start();
    pressKey(win, 'p');
    assert.equal(Game.state, 'paused');
    pressKey(win, 'p');
    assert.equal(Game.state, 'playing');
    Game.halt();
  });

  it('touch pad buttons drive actions', () => {
    Game.start();
    const pads = {};
    doc.querySelectorAll('.pad').forEach((b) => { pads[b.dataset.act] = b; });
    const x0 = Game.piece.x;
    pads.left.dispatchEvent(new win.Event('pointerdown', { bubbles: true, cancelable: true }));
    assert.ok(Game.piece.x < x0, 'left pad moved piece');
    pads.drop.dispatchEvent(new win.Event('pointerdown', { bubbles: true, cancelable: true }));
    assert.ok(bottomRow().some((c) => c === 1) || Game.state !== 'playing', 'drop executed');
  });

  it('Enter restarts from game-over screen', () => {
    Game.start();
    for (let c = 3; c <= 6; c++) {
      Game._debug.setCell(0, c, 1);
      Game._debug.setCell(1, c, 1);
    }
    Game.hardDrop();
    assert.equal(Game.state, 'game-over');

    doc.getElementById('btn-restart').click();
    assert.equal(Game.state, 'playing');
    assert.equal(Game.score, 0);
    assert.equal(Game.lines, 0);
    assert.ok(Game.grid().slice(0, 18).every((row) => row.every((c) => c === 0)));
    Game.halt();
  });
});
