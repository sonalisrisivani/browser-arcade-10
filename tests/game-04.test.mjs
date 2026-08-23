import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, pressKey } from './helpers.mjs';

const DIR = 'games/game-04-2048';
const E = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function row(vals, r) {
  const g = E.slice();
  vals.forEach((v, i) => { g[r * 4 + i] = v; });
  return g;
}

describe('Game 04 — 2048 Merge', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  const vals = () => Array.from(Game.values());

  // Deterministic spawns: value 4 at last free cell / value 2 at first free cell.
  const pinSpawn = () => { win.Math.random = () => 0.999999; };
  const pinSpawnFirst = () => { win.Math.random = () => 0; };

  it('loads page with two starting tiles and idle overlay', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.equal(Game.tileCount(), 2);
    vals().forEach((v) => {
      if (v !== 0) assert.ok(v === 2 || v === 4);
    });
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
  });

  it('start button begins play and hides the overlay', () => {
    doc.getElementById('btn-start').click();
    assert.equal(Game.state, 'playing');
    assert.ok(doc.getElementById('overlay-start').classList.contains('hidden'));
  });

  it('merges a pair left and awards the sum', () => {
    Game._debug.setBoard(row([2, 2, 0, 0], 0));
    pinSpawn();
    assert.ok(Game.move('left'));
    assert.deepEqual(vals().slice(0, 4), [4, 0, 0, 0]);
    assert.equal(vals()[15], 4, 'spawn went to pinned last cell');
    assert.equal(Game.score, 4);
    assert.equal(Game.tileCount(), 2, 'merged pair + spawned tile');
  });

  it('does not double-merge in one move', () => {
    Game._debug.setBoard(row([4, 2, 2, 0], 1));
    pinSpawn();
    Game.move('left');
    assert.deepEqual(vals().slice(4, 8), [4, 4, 0, 0],
      'newly merged 4 must not chain into existing 4');
  });

  it('merges two pairs independently', () => {
    Game._debug.setBoard(row([2, 2, 2, 2], 2));
    pinSpawn();
    const s0 = Game.score;
    Game.move('left');
    assert.deepEqual(vals().slice(8, 12), [4, 4, 0, 0]);
    assert.equal(Game.score, s0 + 8);
  });

  it('no-op moves are rejected and spawn nothing', () => {
    Game._debug.setBoard(row([2, 4, 8, 16], 0));
    const before = vals().join(',');
    assert.equal(Game.move('left'), false);
    assert.equal(vals().join(','), before);
    assert.equal(Game.score, 0);
    assert.equal(Game.canUndo, false);
  });

  it('each valid move spawns exactly one new tile', () => {
    Game._debug.setBoard(row([0, 0, 0, 2], 0));
    const n = Game.tileCount();
    Game.move('left');
    assert.equal(Game.tileCount(), n + 1, 'exactly one tile added');
    assert.equal(vals().filter((v) => v !== 0).length, n + 1);
    assert.equal(vals()[0], 2, 'original tile now flush left');
  });

  it('moves tiles fully to the edge', () => {
    Game._debug.setBoard(row([0, 0, 0, 2], 3));
    pinSpawnFirst();
    Game.move('left');
    assert.equal(vals()[15], 0);
    assert.equal(vals()[12], 2);
  });

  it('undo restores board and score once, then clears', () => {
    Game.reset();
    Game._debug.setBoard(row([2, 2, 0, 0], 0));
    assert.equal(vals().join(','), '2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0');

    Game.move('left');
    assert.equal(Game.score, 4);
    assert.ok(Game.canUndo);

    assert.ok(Game.undo());
    assert.equal(vals().join(','), '2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0');
    assert.equal(Game.score, 0);
    assert.equal(Game.canUndo, false, 'single-step undo consumed');
    assert.equal(Game.undo(), false, 'no second undo');
  });

  it('arrow keys drive moves after start', () => {
    doc.getElementById('btn-start').click();
    Game._debug.setBoard(row([0, 0, 0, 2], 0));
    const n = Game.tileCount();
    pressKey(win, 'ArrowLeft');
    assert.equal(Game.state, 'playing');
    assert.equal(Game.tileCount(), n + 1, 'move accepted → tile spawned');
    pressKey(win, 'x');
    assert.equal(Game.state, 'playing');
  });

  it('detects game over when board is full without merges', () => {
    Game._debug.setBoard([2, 4, 8, 16, 16, 8, 4, 2, 2, 4, 8, 16, 16, 8, 4, 2]);
    assert.equal(Game.move('up'), false, 'dead board rejects moves');
    assert.equal(Game._debug.evaluateOver(), 'over');
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
    assert.equal(doc.getElementById('over-score').textContent, String(Game.score));
  });

  it('a full board with one available merge is not over', () => {
    doc.getElementById('btn-start').click();
    Game._debug.setBoard([2, 4, 8, 16, 16, 8, 4, 2, 2, 4, 8, 16, 16, 8, 4, 4]);
    assert.equal(Game._debug.evaluateOver(), 'playing', 'bottom-right pair can merge');
  });

  it('win overlay appears on first 2048 and continues afterwards', () => {
    Game._debug.setBoard(row([1024, 1024, 0, 0], 0));
    Game.move('left');
    assert.equal(Game.state, 'won');
    assert.ok(!doc.getElementById('overlay-won').classList.contains('hidden'));
    assert.match(doc.getElementById('won-score').textContent, /^\d+$/);

    doc.getElementById('btn-continue').click();
    assert.equal(Game.state, 'playing');

    Game._debug.setBoard(row([2048, 2048, 0, 0], 0));
    Game.move('left');
    assert.equal(Game.state, 'playing', 'second 4096 merge does not retrigger win screen');
    assert.ok(vals().includes(4096));
  });

  it('retry from game-over starts fresh', () => {
    Game._debug.setBoard([2, 4, 8, 16, 16, 8, 4, 2, 2, 4, 8, 16, 16, 8, 4, 2]);
    Game._debug.evaluateOver();
    assert.equal(Game.state, 'over');

    doc.getElementById('btn-retry').click();
    assert.equal(Game.state, 'playing');
    assert.equal(Game.score, 0);
    assert.equal(Game.tileCount(), 2);
    assert.ok(doc.getElementById('overlay-over').classList.contains('hidden'));
  });

  it('best score persists when exceeded', () => {
    assert.equal(Game.best, 0, 'fresh window starts at zero best');
    Game._debug.setBoard(row([512, 512, 256, 256], 0));
    Game.move('left');
    assert.equal(Game.score, 1536);
    assert.equal(Game.best, 1536, 'best updates immediately on exceed');
  });

  it('restart mid-game resets everything', () => {
    Game._debug.setBoard(row([128, 128, 0, 0], 1));
    Game.move('left');
    doc.getElementById('btn-new').click();
    assert.equal(Game.score, 0);
    assert.equal(Game.tileCount(), 2);
    assert.equal(Game.canUndo, false);
    assert.equal(Game.state, 'playing');
  });
});
