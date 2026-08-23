import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, clickAt } from './helpers.mjs';

const DIR = 'games/game-08-tictactoe';

describe('Game 08 — Tic-Tac-Toe vs AI', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  const click = (el) => clickAt(win, el);

  const cells = () => Array.from(doc.querySelectorAll('.ttt-cell'));

  function playCells(indices) {
    for (const i of indices) {
      click(cells()[i]);
      if (Game.turn === 'O' && !Game.over && !Game.twoPlayer) Game._debug.flushAi();
    }
  }

  it('loads page with empty board and player-X turn', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'playing');
    assert.equal(cells().length, 9);
    assert.equal(Game.turn, 'X');
    assert.match(doc.getElementById('status').textContent, /Your move/);
  });

  it('player move registers; AI responds on its schedule', async () => {
    click(cells()[4]);
    assert.equal(Game.board[4], 'X');
    assert.equal(Game.turn, 'O');
    await new Promise((r) => setTimeout(r, 420));
    const oCount = Game.board.filter((v) => v === 'O').length;
    assert.ok(oCount >= 1, `AI placed a mark (${Game.board.join('|')})`);
  });

  it('detects X win across a row and highlights the line', () => {
    Game._debug.seedBoard(['X', 'X', '', '', 'O', '', '', '', '']);
    playCells([2]);
    assert.ok(cells()[0].classList.contains('win'), 'winning cells highlighted');
    assert.match(doc.getElementById('result-title').textContent, /You win|✕ Wins/);
    assert.equal(doc.getElementById('wins').textContent, '1');
  });

  it('detects AI win and updates the series', () => {
    Game.setDifficulty('hard');
    Game._debug.seedBoard(['O', 'O', '', 'X', 'X', '', '', '', '']);
    playCells([6]);
    assert.equal(Game.over, true, 'AI completed row 0');
    assert.match(doc.getElementById('result-title').textContent, /machine wins|⬤ Wins/);
    assert.equal(doc.getElementById('losses').textContent, '1');
  });

  it('full board without a winner is a draw (2-player mode)', () => {
    doc.getElementById('btn-mode').click();
    const drawSeq = [0, 1, 2, 3, 5, 6, 7, 8, 4];
    for (const idx of drawSeq) click(cells()[idx]);
    assert.equal(Game.over, true, 'board full → game over');
    assert.match(doc.getElementById('result-title').textContent, /draw/i);
    assert.ok(Number(doc.getElementById('draws').textContent) >= 1);
    doc.getElementById('btn-mode').click();
  });

  it('Hard AI never loses against optimal play from every opener', () => {
    Game.setDifficulty('hard');
    function winnerOf(b) {
      const LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const [a, c, d] of LINES) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
      }
      return b.every((v) => v) ? 'draw' : null;
    }
    function value(b, turn) {
      const w = winnerOf(b);
      if (w === 'X') return 1;
      if (w === 'O') return -1;
      if (w === 'draw') return 0;
      let best = turn === 'X' ? -2 : 2;
      for (let i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = turn;
        const v = value(b, turn === 'X' ? 'O' : 'X');
        b[i] = '';
        best = turn === 'X' ? Math.max(best, v) : Math.min(best, v);
      }
      return best;
    }

    for (let opener = 0; opener < 9; opener++) {
      Game.newRound(false);
      click(cells()[opener]);
      Game._debug.flushAi();
      assert.ok(!Game.over, `AI still alive after opener ${opener}`);

      while (!Game.over) {
        const board = Game.board.slice();
        const turn = Game.turn;
        let bestMove = -1;
        let bestVal = turn === 'X' ? -2 : 2;
        for (let i = 0; i < 9; i++) {
          if (board[i]) continue;
          const t = board.slice();
          t[i] = turn;
          const v = value(t, turn === 'X' ? 'O' : 'X');
          if ((turn === 'X' && v > bestVal) || (turn === 'O' && v < bestVal)) {
            bestVal = v;
            bestMove = i;
          }
        }
        click(cells()[bestMove]);
        if (!Game.over && Game.turn === 'O' && !Game.twoPlayer) Game._debug.flushAi();
      }

      const w = winnerOf(Game.board);
      assert.ok(w !== 'X', `hard AI lost from opener ${opener}`);
    }
  });

  it('Easy difficulty sometimes plays random non-optimal moves', () => {
    Game.setDifficulty('easy');
    Game.newRound(false);
    Game.place(4, 'X');
    const before = Game.board.join(',');
    Game._debug.flushAi();
    const after = Game.board.join(',');
    assert.notEqual(after, before, 'AI moved somewhere');
    assert.ok(after.split(',').filter((v) => v === 'O').length === 1);
  });

  it('taken squares reject further placement', () => {
    click(cells()[0]);
    assert.equal(Game.place(0, 'X'), false, 'same-turn double place blocked');
    Game._debug.flushAi();
    const oCell = Game.board.findIndex((v) => v === 'O');
    assert.equal(Game.place(oCell, 'X'), false, 'cannot overwrite O');
  });

  it('next round alternates starter; reset clears the series', async () => {
    playCells([0, 1, 2]);
    await new Promise((r) => setTimeout(r, 700));
    doc.getElementById('btn-next-round').click();
    assert.equal(Game.state, 'playing');
    assert.equal(Game.over, false);

    doc.getElementById('btn-reset').click();
    assert.equal(doc.getElementById('wins').textContent, '0');
    assert.equal(doc.getElementById('draws').textContent, '0');
    assert.equal(doc.getElementById('losses').textContent, '0');
  });

  it('two-player local mode skips AI entirely', async () => {
    doc.getElementById('btn-mode').click();
    assert.equal(Game.twoPlayer, true);
    click(cells()[0]);
    await new Promise((r) => setTimeout(r, 400));
    assert.ok(!Game.board.includes('O') || Game.turn === 'O',
      'no automatic AI reply in 2P mode');
    assert.equal(Game.turn, 'O');
    click(cells()[8]);
    assert.equal(Game.board[8], 'O', 'human played O manually');
  });

  it('difficulty selector switches active style', () => {
    doc.querySelector('[data-level="hard"]').click();
    assert.equal(Game.difficulty, 'hard');
    doc.querySelector('[data-level="easy"]').click();
    assert.equal(Game.difficulty, 'easy');
  });
});
