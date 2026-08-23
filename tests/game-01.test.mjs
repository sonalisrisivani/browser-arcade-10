import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, pressKey, clickAt } from './helpers.mjs';

const DIR = 'games/game-01-snake';

describe('Game 01 — Neon Snake', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  const click = (el) => clickAt(win, el);

  after(() => {
    try { Game.halt(); } catch (e) { /* noop */ }
  });

  function ensureStopped() {
    if (Game.state === 'running' || Game.state === 'paused') Game.togglePause();
    if (Game.state === 'running') Game.togglePause();
  }

  it('loads page, exposes Game API, shows start overlay', () => {
    assert.ok(Game, 'window.Game exposed');
    assert.equal(Game.state, 'idle');
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
    assert.ok(doc.getElementById('overlay-pause').classList.contains('hidden'));
    assert.ok(doc.getElementById('overlay-over').classList.contains('hidden'));
  });

  it('starts on button click and hides overlays', () => {
    click(doc.getElementById('btn-start'));
    assert.equal(Game.state, 'running');
    assert.ok(doc.getElementById('overlay-start').classList.contains('hidden'));
    ensureStopped();
  });

  it('moves right on step from initial state', () => {
    Game.start();
    const before = { ...Game.snake[0] };
    Game.step();
    const after = Game.snake[0];
    assert.equal(after.x, before.x + 1);
    assert.equal(after.y, before.y);
    ensureStopped();
  });

  it('steers with arrow keys and blocks reversal', () => {
    Game.start();
    pressKey(win, 'ArrowDown');
    Game.step();
    assert.equal(Game.snake[0].y, 11);

    pressKey(win, 'ArrowUp');
    Game.step();
    assert.equal(Game.snake[0].y, 12, 'reverse input ignored');

    pressKey(win, 'a');
    Game.step();
    assert.equal(Game.snake[0].x, 9, 'WASD works');

    ensureStopped();
  });

  it('eats food: scores 10 × level, grows, respawns food elsewhere', () => {
    Game.start();
    Game.setDir('down');
    const len0 = Game.snake.length;
    Game.placeFood(10, 12);
    Game.step(); Game.step();
    assert.equal(Game.snake[0].x, 10);
    assert.equal(Game.snake[0].y, 12);
    assert.equal(Game.score, 10);
    assert.equal(Game.snake.length, len0 + 1);
    assert.ok(Game.food);
    assert.ok(!(Game.food.x === 10 && Game.food.y === 12), 'food respawned elsewhere');
    ensureStopped();
  });

  it('levels up every 5 foods and speeds up', () => {
    Game.start();
    for (let i = 0; i < 5; i++) {
      const head = Game.snake[0];
      Game.placeFood(head.x + 1, head.y);
      Game.step();
      if (i < 4) assert.equal(Game.level, 1);
    }
    assert.equal(Game.score, 50);
    assert.equal(Game.foodsEaten === undefined ? Game.level : Game.level, 2);
    assert.equal(Game.level, 2);
    assert.equal(Game.interval(), 135);
    ensureStopped();
  });

  it('dies on wall collision and shows game-over overlay', () => {
    Game.start();
    for (let i = 0; i < 20 && Game.state === 'running'; i++) Game.step();
    assert.equal(Game.state, 'game-over');
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
    assert.equal(doc.getElementById('final-score').textContent, String(Game.score));
    assert.ok(doc.getElementById('final-length').textContent.length > 0);
  });

  it('dies on self collision', () => {
    Game.start();
    Game.snake.length = 0;
    Game.snake.push({ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 });
    Game.setDir('right');
    Game.step();
    assert.equal(Game.state, 'game-over');
  });

  it('restart resets score, length and returns to running', () => {
    Game.start();
    Game.placeFood(10, 9);
    Game.setDir('up');
    Game.step();
    assert.ok(Game.score > 0);
    click(doc.getElementById('btn-restart'));
    assert.equal(Game.state, 'running');
    assert.equal(Game.score, 0);
    assert.equal(Game.snake.length, 3);
    assert.ok(doc.getElementById('overlay-over').classList.contains('hidden'));
    ensureStopped();
  });

  it('pause/resume works via space and button', () => {
    Game.start();
    pressKey(win, ' ');
    assert.equal(Game.state, 'paused');
    assert.ok(!doc.getElementById('overlay-pause').classList.contains('hidden'));

    click(doc.getElementById('btn-resume'));
    assert.equal(Game.state, 'running');
    assert.ok(doc.getElementById('overlay-pause').classList.contains('hidden'));

    pressKey(win, ' ');
    assert.equal(Game.state, 'paused');
    click(doc.getElementById('btn-resume'));
    ensureStopped();
  });

  it('Enter restarts from game-over screen', () => {
    Game.start();
    for (let i = 0; i < 25 && Game.state === 'running'; i++) Game.step();
    assert.equal(Game.state, 'game-over');
    pressKey(win, 'Enter');
    assert.equal(Game.state, 'running');
    assert.equal(Game.snake.length, 3);
    assert.equal(Game.score, 0);
    ensureStopped();
  });

  it('auto-pauses on window blur', () => {
    Game.start();
    win.dispatchEvent(new win.Event('blur'));
    assert.equal(Game.state, 'paused');
    Game.togglePause();
    ensureStopped();
  });

  it('animation loop advances the snake over time', async () => {
    Game.start();
    const x0 = Game.snake[0].x;
    await new Promise((r) => setTimeout(r, 220));
    assert.equal(Game.state, 'running');
    assert.ok(Game.snake[0].x > x0, `head advanced (x ${x0} → ${Game.snake[0].x})`);
    ensureStopped();
  });

  it('HUD reflects score and level', () => {
    assert.equal(doc.getElementById('score').textContent, '0');
    assert.equal(doc.getElementById('level').textContent, '1');
    assert.match(doc.getElementById('best').textContent, /^\d+$/);
  });

  it('touch d-pad buttons steer the snake', () => {
    Game.start();
    const pad = doc.querySelector('.pad[data-dir="down"]');
    pad.dispatchEvent(new win.Event('pointerdown', { bubbles: true, cancelable: true }));
    Game.step();
    assert.equal(Game.snake[0].y, 11);
    ensureStopped();
  });
});
