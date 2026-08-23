import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './helpers.mjs';

const DIR = 'games/game-07-flappy-glide';
const FLOOR = 560;
const R = 14;

describe('Game 07 — Flappy Glide', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try { Game.halt(); } catch { /* noop */ }
  });

  it('loads page in idle state with start overlay', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
    assert.equal(Game.score, 0);
  });

  it('start begins play; bird falls under gravity between flaps', () => {
    Game.start();
    assert.equal(Game.state, 'playing');
    const v0 = Game.bird.v;
    Game.update(100);
    const yDown = Game.bird.y;
    assert.ok(Game.bird.v > v0, 'gravity accelerated the bird');
    assert.ok(yDown > 300);

    Game.flap();
    assert.ok(Game.bird.v < 0, 'flap gives upward impulse');
    Game.halt();
  });

  it('pipes spawn ahead and scroll left over time', () => {
    Game.start();
    for (let i = 0; i < 10; i++) { Game.flap(); Game.update(120); }
    assert.ok(Game.pipes.length >= 1, `pipes exist (${Game.pipes.length})`);
    Game._debug.clearPipes();
    Game._debug.addPipeAt(400, 200, 190);
    const x0 = Game.pipes[0].x;
    for (let i = 0; i < 6; i++) { Game.flap(); Game.update(60); }
    assert.ok(Game.pipes[0].x < x0, `pipe moved left (${x0} → ${Game.pipes[0].x})`);
    Game.halt();
  });

  it('passing a pipe scores a point', () => {
    Game.start();
    Game._debug.clearPipes();
    Game._debug.addPipeAt(210, 250, 190);
    const b = Game.bird;
    b.y = 330;
    for (let i = 0; i < 30 && Game.score === 0 && Game.state === 'playing'; i++) {
      b.v = -0.03;
      Game.update(50);
    }
    assert.equal(Game.score, 1, `score=${Game.score}`);
    Game.halt();
  });

  it('colliding with a pipe ends the game and shows overlay', () => {
    Game.start();
    Game._debug.clearPipes();
    Game._debug.addPipeAt(150, 250, 190);
    Game.bird.y = 260;
    Game.update(16);
    assert.equal(Game.state, 'game-over');
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
  });

  it('hitting the floor is fatal too', () => {
    Game.start();
    Game._debug.clearPipes();
    Game.bird.y = FLOOR - R - 2;
    Game.bird.v = 0.5;
    Game.update(30);
    assert.equal(Game.state, 'game-over');
  });

  it('ceiling clamps position without death', () => {
    Game.start();
    Game._debug.clearPipes();
    Game.bird.y = 20;
    Game.bird.v = -0.5;
    for (let i = 0; i < 10 && Game.state === 'playing'; i++) Game.update(16);
    if (Game.state === 'playing') {
      assert.ok(Game.bird.y >= R - 1);
    }
    assert.notEqual(Game.state, 'game-over', 'ceiling alone never kills');
    Game.halt();
  });

  it('speed rises with score while gaps shrink', () => {
    const s0 = Game.speed;
    const g0 = Game.gapHeight;
    Game._debug.setScore(40);
    assert.ok(Game.speed > s0, `${s0} → ${Game.speed}`);
    assert.ok(Game.gapHeight < g0, `${g0} → ${Game.gapHeight}`);
    assert.ok(Game.gapHeight >= 120, 'gap has a floor value');
  });

  it('medal thresholds render on game over', () => {
    Game.start();
    Game._debug.setScore(25);
    Game._debug.clearPipes();
    Game.bird.y = FLOOR - R - 1;
    Game.bird.v = 1;
    Game.update(30);
    assert.match(doc.getElementById('medal-text').textContent, /Silver/);
    assert.equal(doc.getElementById('final-score').textContent, '25');
    assert.equal(doc.getElementById('best').textContent, '25');
  });

  it('pause/resume works via P key', () => {
    Game.start();
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'p' }));
    assert.equal(Game.state, 'paused');
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'p' }));
    assert.equal(Game.state, 'playing');
    Game.halt();
  });

  it('R restarts after a crash with everything reset', () => {
    Game.start();
    Game._debug.setScore(12);
    Game._debug.addPipeAt(150, 250, 190);
    Game.bird.y = 260;
    Game.update(16);
    assert.equal(Game.state, 'game-over');

    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'r' }));
    assert.equal(Game.state, 'playing');
    assert.equal(Game.score, 0);
    assert.ok(Game.pipes.length <= 1);
    Game.halt();
  });

  it('canvas tap flaps during play', () => {
    Game.start();
    const canvas = doc.getElementById('sky');
    const vBefore = Game.bird.v;
    canvas.dispatchEvent(new win.Event('pointerdown', { bubbles: true, cancelable: true }));
    assert.ok(Game.bird.v < 0 && (vBefore >= 0 || Game.bird.v < vBefore), 'tap caused flap');
    Game.halt();
  });
});
