import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, pressKey } from './helpers.mjs';

const DIR = 'games/game-05-breakout';

describe('Game 05 — Brick Breaker', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try { Game.halt(); } catch { /* noop */ }
  });

  function play() {
    Game.start();
    Game.launch(0);
  }

  it('loads page in idle state with start overlay and full HUD', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
    assert.equal(doc.getElementById('lives').textContent, '♥♥♥');
    assert.equal(doc.getElementById('level').textContent, '1/3');
  });

  it('start puts ball on paddle in ready state; launch sends it upward', () => {
    Game.start();
    assert.equal(Game.state, 'ready');
    assert.equal(Game.stuck, true);
    const b = Game.ball;
    assert.equal(b.y, 554);

    assert.ok(Game.launch(-20));
    assert.equal(Game.state, 'playing');
    assert.equal(Game.stuck, false);
    assert.ok(b.vy < 0, 'ball moves up after launch');
    Game.halt();
  });

  it('bounces off the left wall without escaping', () => {
    play();
    Game._debug.placeBall(6, 300, -0.3, 0);
    Game.update(16);
    assert.ok(Game.ball.x >= 7);
    assert.ok(Game.ball.vx > 0, 'vx flipped inward');
    Game.halt();
  });

  it('paddle bounce angle follows hit offset', () => {
    play();
    Game.setPaddle(240);

    Game._debug.placeBall(240 + 30, 566 - 8, 0, 0.3);
    Game.update(16);
    assert.ok(Game.ball.vy < 0, 'right-half hit still goes up');
    assert.ok(Game.ball.vx > 0.2, 'right-half hit angles right');

    Game.setPaddle(240);
    Game._debug.placeBall(240 - 30, 566 - 8, 0, 0.3);
    Game.update(16);
    assert.ok(Game.ball.vx < -0.2, 'left-half hit angles left');
    Game.halt();
  });

  it('destroys a brick on contact and scores row points + combo', () => {
    play();
    const target = Game.bricks.find((k) => k.alive && k.row === 0);
    const left0 = Game.bricksLeft;
    Game._debug.placeBall(target.x + target.w / 2, target.y + target.h + 3, 0, -0.3);

    Game.update(16);

    assert.equal(target.alive, false, 'target brick destroyed');
    assert.ok(Game.bricksLeft < left0, 'wall shrank');
    assert.ok(Game.bricks.length - Game.bricksLeft >= 1);
    assert.ok(Game.score >= target.points, `score gained (${Game.score} ≥ ${target.points})`);
    Game.halt();
  });

  it('combo grows across multiple bricks before paddle contact', () => {
    play();
    const alive = Game.bricks.filter((k) => k.alive);
    const a = alive[10];
    const b = alive[11];
    const s0 = Game.score;

    Game._debug.placeBall(a.x + a.w / 2, a.y + a.h + 3, 0, -0.3);
    Game.update(16);
    const scoreAfterA = Game.score;

    if (b.alive && Game.state === 'playing') {
      Game._debug.placeBall(b.x + b.w / 2, b.y + b.h + 3, 0, -0.3);
      Game.update(16);
      assert.ok(Game.combo >= 2, `combo grew (${Game.combo})`);
      assert.ok(Game.score - scoreAfterA >= b.points, 'further bricks keep scoring');
    }
    Game.halt();
  });

  it('loses a life when the ball passes the floor', () => {
    play();
    Game._debug.placeBall(240, 599, 0, 0.4);
    Game.update(40);
    assert.equal(Game.lives, 2);
    assert.equal(Game.state, 'ready');
    assert.equal(Game.stuck, true);
    Game.halt();
  });

  it('game over after three lost lives shows end overlay', () => {
    play();
    for (let i = 0; i < 3 && Game.state !== 'over'; i++) {
      if (Game.state === 'ready') Game.launch(0);
      Game._debug.placeBall(240, 599, 0, 0.4);
      Game.update(40);
    }
    assert.equal(Game.state, 'over');
    assert.ok(!doc.getElementById('overlay-end').classList.contains('hidden'));
    assert.match(doc.getElementById('end-title').textContent, /Game Over/);
  });

  it('clearing all bricks triggers level-clear, then next level is faster', () => {
    play();
    const speed1 = Game.ball.speed;
    Game._debug.clearBricks();
    Game.update(16);
    assert.equal(Game.state, 'level-clear');
    assert.ok(!doc.getElementById('overlay-level').classList.contains('hidden'));

    doc.getElementById('btn-next').click();
    assert.equal(Game.level, 2);
    assert.equal(Game.state, 'ready');
    assert.equal(Game.bricksLeft, 40, 'level 2 wall is 5×8');
    assert.ok(Game.ball.speed > speed1, `speed ${speed1} → ${Game.ball.speed}`);
    Game.halt();
  });

  it('clearing level 3 grants victory with life bonus', () => {
    play();
    Game.nextLevel();
    Game.launch(0);
    Game.nextLevel();
    Game.launch(0);
    assert.equal(Game.level, 3);

    Game._debug.clearBricks();
    Game.update(16);
    assert.equal(Game.state, 'victory');
    assert.match(doc.getElementById('end-title').textContent, /Victory/);
    assert.ok(Game.score > 0);
  });

  it('pause/resume works during play', () => {
    play();
    pressKey(win, ' ');
    assert.equal(Game.state, 'paused');
    pressKey(win, ' ');
    assert.equal(Game.state, 'playing');
    Game.halt();
  });

  it('keyboard steers the paddle', () => {
    Game.start();
    const x0 = Game.paddleX;
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    Game.update(50);
    doc.dispatchEvent(new win.KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
    assert.ok(Game.paddleX > x0, `paddle moved right (${x0} → ${Game.paddleX})`);
    Game.halt();
  });

  it('retry from game-over resets score/lives/level', () => {
    play();
    for (let i = 0; i < 3 && Game.state !== 'over'; i++) {
      if (Game.state === 'ready') Game.launch(0);
      Game._debug.placeBall(240, 599, 0, 0.4);
      Game.update(40);
    }
    doc.getElementById('btn-retry').click();
    assert.equal(Game.state, 'ready');
    assert.equal(Game.score, 0);
    assert.equal(Game.lives, 3);
    assert.equal(Game.level, 1);
    Game.halt();
  });
});
