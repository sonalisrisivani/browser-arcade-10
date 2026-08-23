import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, clickAt } from './helpers.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const DIR = 'games/game-02-memory-match';

describe('Game 02 — Memory Card Match', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  const click = (el) => clickAt(win, el);

  const cells = () => Array.from(doc.querySelectorAll('.card-cell'));

  function pairIndices(pairValue) {
    const idx = [];
    Game.deck.forEach((card, i) => {
      if (card.pair === pairValue) idx.push(i);
    });
    return idx;
  }

  function flipPair(a, b) {
    click(cells()[a]);
    click(cells()[b]);
  }

  it('loads page, builds 16-card board in idle state', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.equal(cells().length, 16);
    assert.equal(doc.getElementById('moves').textContent, '0');
    assert.equal(doc.getElementById('pairs').textContent, '0/8');
  });

  it('first flip starts the game and reveals the card', () => {
    click(cells()[0]);
    assert.equal(Game.state, 'playing');
    assert.ok(cells()[0].classList.contains('flipped'));
    Game.reset();
  });

  it('ignores double-flip of the same card and clicks on matched cards', () => {
    const [a, b] = pairIndices(Game.deck[0].pair);
    click(cells()[a]);
    click(cells()[a]);
    assert.equal(doc.querySelectorAll('.card-cell.flipped').length, 1);

    click(cells()[b]);
    assert.equal(Game.matched, 1, 'second distinct card completes the pair');
    click(cells()[a]);
    assert.equal(doc.querySelectorAll('.card-cell.flipped').length, 0,
      'matched cards do not re-enter play');
    Game.reset();
  });

  it('matching a pair keeps it face-up and counts one move', () => {
    const [a, b] = pairIndices(3);
    flipPair(a, b);
    assert.equal(Game.moves, 1);
    assert.equal(Game.matched, 1);
    assert.ok(cells()[a].classList.contains('matched'));
    assert.ok(cells()[b].classList.contains('matched'));
    assert.equal(doc.getElementById('pairs').textContent, '1/8');
    Game.reset();
  });

  it('mismatch flips both cards back after the delay', async () => {
    const [a1] = pairIndices(0);
    const [b1] = pairIndices(1);
    flipPair(a1, b1);
    assert.equal(Game.moves, 1);
    assert.equal(doc.querySelectorAll('.card-cell.flipped').length, 2);

    await delay(820);

    assert.equal(doc.querySelectorAll('.card-cell.flipped').length, 0,
      'mismatched cards hidden again');

    click(cells()[a1]);
    assert.ok(cells()[a1].classList.contains('flipped'),
      'board unlocked after flip-back — new flips accepted');
    assert.equal(Game.moves, 1, 'single flip does not count a move');
    Game.reset();
  });

  it('timer ticks while playing', async () => {
    click(cells()[0]);
    const t0 = Game.seconds;
    await delay(2100);
    assert.ok(Game.seconds >= t0 + 2, `seconds advanced (${t0} → ${Game.seconds})`);
    Game.reset();
    assert.equal(doc.getElementById('time').textContent, '0s');
  });

  function solveAll() {
    for (let p = 0; p < 8; p++) {
      const [a, b] = pairIndices(p);
      flipPair(a, b);
    }
  }

  it('solving every pair shows the win overlay with stars and stats', () => {
    solveAll();
    assert.equal(Game.state, 'won');
    assert.ok(!doc.getElementById('overlay-win').classList.contains('hidden'));
    assert.match(doc.getElementById('win-stars').textContent, /⭐+/);
    assert.equal(Number(doc.getElementById('win-moves').textContent), Game.moves);
    assert.equal(doc.getElementById('pairs').textContent, '8/8');
    Game.reset();
  });

  it('three-star game stores a best time; win modal shows it', () => {
    solveAll();
    const best = doc.getElementById('win-time').textContent;
    assert.equal(doc.getElementById('best').textContent, best + 's');
    Game.reset();
    assert.equal(doc.getElementById('best').textContent, best + 's',
      'best persists across restart');
  });

  it('restart reshuffles and resets counters', () => {
    solveAll();
    Game.reset();
    assert.equal(Game.state, 'idle');
    assert.equal(Game.moves, 0);
    assert.equal(Game.matched, 0);
    assert.equal(cells().length, 16);
    assert.equal(doc.querySelectorAll('.card-cell.matched').length, 0);
    assert.ok(doc.getElementById('overlay-win').classList.contains('hidden'));
  });

  it('6×6 difficulty deals 36 cards and updates HUD', () => {
    click(doc.querySelector('.seg-btn[data-size="6"]'));
    assert.equal(Game.size, 6);
    assert.equal(cells().length, 36);
    assert.equal(doc.getElementById('pairs').textContent, '0/18');
    const [a, b] = pairIndices(5);
    flipPair(a, b);
    assert.equal(Game.matched, 1);
    assert.equal(doc.getElementById('pairs').textContent, '1/18');
    Game.reset();
  });

  it('star rating thresholds are sane', () => {
    assert.equal(Game.starsFor(8), 3);
    assert.equal(Game.starsFor(11), 3);
    assert.equal(Game.starsFor(13), 2);
    assert.equal(Game.starsFor(16), 2);
    assert.equal(Game.starsFor(30), 1);
  });

  it('clicking Play Again starts a fresh game', () => {
    solveAll();
    click(doc.getElementById('btn-again'));
    assert.equal(Game.state, 'idle');
    assert.equal(Game.moves, 0);
    Game.reset();
  });
});
