import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './helpers.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const DIR = 'games/game-03-minesweeper';

describe('Game 03 — Minesweeper Classic', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try {
      if (Game && (Game.state === 'playing' || Game.state === 'idle')) Game.reset();
    } catch { /* window already torn down */ }
  });

  const cells = () => Array.from(doc.querySelectorAll('.ms-cell'));

  it('loads page with a 9×9 beginner board and idle state', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.equal(cells().length, 81);
    assert.equal(doc.getElementById('mines').textContent, '10');
    assert.equal(doc.getElementById('time').textContent, '0');
  });

  it('first reveal is always safe and starts the game + timer', async () => {
    Game.revealAt(40);
    assert.equal(Game.state, 'playing');
    assert.equal(Game.grid[40].mine, false);
    const t0 = Game.seconds;
    await delay(1600);
    assert.ok(Game.seconds >= t0 + 1, `timer advanced (${t0} → ${Game.seconds})`);
    Game.reset();
  });

  it('flood fill reveals zero region and number frontier', () => {
    Game._debug.seedMines([0, 1, 2]);
    Game.revealAt(40);

    assert.equal(Game.grid[40].revealed, true);
    assert.equal(Game.grid[40].adjacent, 0);
    assert.equal(Game.grid[80].revealed, true, 'far corner reached by flood');

    assert.equal(Game.grid[0].mine, true);
    assert.equal(Game.grid[0].revealed, false, 'mines stay hidden on flood');

    assert.ok(Game.grid[3].revealed && Game.grid[3].adjacent === 1,
      'cell next to single mine shows 1');
    assert.ok(Game.grid[11].revealed && Game.grid[11].adjacent >= 1,
      'cell below mine column numbered');

    assert.equal(cells()[40].classList.contains('revealed'), true);
    assert.ok(cells()[3].classList.contains('n1'));
    Game.reset();
  });

  it('winning clears the banner, stores best time, celebrates face', () => {
    Game._debug.seedMines([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    Game.revealAt(40);

    assert.equal(Game.state, 'won');
    const banner = doc.getElementById('banner');
    assert.ok(!banner.classList.contains('hidden'));
    assert.match(banner.textContent, /Cleared in/);
    assert.equal(doc.getElementById('btn-face').textContent, '🎉 New');
    assert.match(doc.getElementById('best').textContent, /^\d+s$/);
    Game.reset();
  });

  it('losing reveals all mines, marks the hit cell, shows lose banner', () => {
    Game._debug.seedMines([10, 20, 30, 40, 50, 60, 70, 71, 72, 73]);
    Game.revealAt(80);
    Game.revealAt(30);

    assert.equal(Game.state, 'lost');
    assert.ok(cells()[30].classList.contains('exploded'));
    assert.equal(cells()[30].textContent, '💥');
    assert.equal(Game.grid[10].revealed, true, 'all mines shown after loss');
    assert.match(doc.getElementById('banner').textContent, /Boom/);
    assert.equal(doc.getElementById('btn-face').textContent, '😵 New');
    Game.reset();
  });

  it('flags toggle via API and contextmenu; flagged cells resist reveal', () => {
    assert.ok(Game.flagAt(12));
    assert.equal(Game.flags, 1);
    assert.equal(doc.getElementById('mines').textContent, '9');
    assert.equal(cells()[12].textContent, '🚩');

    cells()[12].dispatchEvent(new win.MouseEvent('contextmenu', {
      bubbles: true, cancelable: true,
    }));
    assert.equal(Game.flags, 0, 'contextmenu unflags');

    Game.flagAt(13);
    assert.equal(Game.revealAt(13), false, 'cannot reveal flagged cell');
    assert.equal(Game.grid[13].revealed, false);

    Game.revealAt(40);
    assert.ok(Game.grid[40].revealed || Game.grid[40].flagged,
      'unflagged cells still reveal normally');
  });

  it('flag mode button reroutes clicks to flagging', () => {
    const btn = doc.getElementById('btn-flagmode');
    btn.click();
    assert.equal(btn.getAttribute('aria-pressed'), 'true');

    cells()[15].click();
    assert.equal(Game.flags, 1);
    assert.equal(Game.grid[15].flagged, true);

    btn.click();
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    Game.reset();
  });

  it('long-press (touch) plants a flag', async () => {
    board_dispatch('pointerdown', 16);
    await delay(520);
    board_dispatch('pointerup', 16);
    assert.equal(Game.grid[16].flagged, true, 'long press flagged the cell');

    board_dispatch('pointerdown', 17);
    await delay(30);
    board_dispatch('pointerup', 17);
    assert.equal(Game.grid[17].flagged, false, 'quick tap does not flag');
    Game.reset();
  });

  function board_dispatch(type, index) {
    cells()[index].dispatchEvent(new win.Event(type, { bubbles: true }));
  }

  it('intermediate difficulty builds a 16×16 board with 40 mines', () => {
    doc.querySelector('.seg-btn[data-level="intermediate"]').click();
    assert.equal(cells().length, 256);
    assert.equal(doc.getElementById('mines').textContent, '40');
    assert.equal(Game.cols, 16);
    Game._debug.seedMines(Array.from({ length: 40 }, (_, i) => i * 6 % 256));
    Game.revealAt(200);
    assert.notEqual(Game.state, 'idle');
    Game.reset();
  });

  it('restart mid-game returns to a fresh idle board', () => {
    Game._debug.seedMines([7]);
    Game.revealAt(40);
    Game.flagAt(50);
    assert.equal(Game.state, 'playing');

    doc.getElementById('btn-face').click();
    assert.equal(Game.state, 'idle');
    assert.equal(Game.flags, 0);
    assert.equal(Game.seconds, 0);
    assert.equal(doc.querySelectorAll('.ms-cell.revealed').length, 0);
    assert.equal(doc.getElementById('mines').textContent, '10');
  });
});
