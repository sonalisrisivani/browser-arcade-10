(function () {
  'use strict';

  var LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  var boardEl = null;
  var els = {};
  var aiTimer = null;

  var state = {
    mode: 'playing',
    board: new Array(9).fill(''),
    turn: 'X',
    starter: 'X',
    difficulty: 'medium',
    twoPlayer: false,
    over: false,
    wins: 0,
    draws: 0,
    losses: 0
  };

  function winnerOf(board) {
    for (var i = 0; i < LINES.length; i++) {
      var L = LINES[i];
      if (board[L[0]] && board[L[0]] === board[L[1]] && board[L[0]] === board[L[2]]) {
        return { mark: board[L[0]], line: L };
      }
    }
    for (var j = 0; j < 9; j++) {
      if (!board[j]) return null;
    }
    return { mark: 'draw', line: [] };
  }

  function emptyIndices(board) {
    var out = [];
    for (var i = 0; i < 9; i++) if (!board[i]) out.push(i);
    return out;
  }

  function minimax(board, isAi) {
    var result = winnerOf(board);
    if (result) {
      if (result.mark === 'O') return { score: 10 };
      if (result.mark === 'X') return { score: -10 };
      return { score: 0 };
    }
    var best = { score: isAi ? -Infinity : Infinity, move: -1 };
    var empties = emptyIndices(board);
    for (var i = 0; i < empties.length; i++) {
      var m = empties[i];
      board[m] = isAi ? 'O' : 'X';
      var s = minimax(board, !isAi).score;
      board[m] = '';
      if (isAi ? s > best.score : s < best.score) {
        best = { score: s, move: m };
      }
    }
    return best;
  }

  function aiMove() {
    var empties = emptyIndices(state.board);
    if (!empties.length) return;

    var move;
    var roll = Math.random();

    if (state.difficulty === 'easy') {
      move = roll < 0.65
        ? empties[Math.floor(Math.random() * empties.length)]
        : minimax(state.board.slice(), true).move;
    } else if (state.difficulty === 'medium') {
      move = roll < 0.35
        ? empties[Math.floor(Math.random() * empties.length)]
        : minimax(state.board.slice(), true).move;
    } else {
      move = minimax(state.board.slice(), true).move;
    }

    place(move, 'O');
  }

  function place(i, mark) {
    if (state.over || state.board[i] || state.turn !== mark) return false;
    state.board[i] = mark;
    renderCell(i);

    var result = winnerOf(state.board);
    if (result) {
      finish(result);
      return true;
    }

    state.turn = mark === 'X' ? 'O' : 'X';
    updateStatus();

    if (!state.twoPlayer && state.turn === 'O' && !state.over) {
      scheduleAi();
    }
    return true;
  }

  function scheduleAi() {
    clearTimeout(aiTimer);
    aiTimer = setTimeout(function () {
      if (state.mode !== 'playing' || state.over || state.twoPlayer) return;
      aiMove();
    }, 320);
  }

  function finish(result) {
    state.over = true;
    state.mode = 'result';
    clearTimeout(aiTimer);

    if (result.line.length) {
      result.line.forEach(function (i) {
        boardEl.children[i].classList.add('win');
      });
    }

    if (result.mark === 'draw') {
      state.draws++;
      els.resultTitle.textContent = "It's a draw!";
      els.resultDetail.textContent = 'Nobody blinked.';
    } else if (result.mark === 'X') {
      state.wins++;
      els.resultTitle.textContent = state.twoPlayer ? '✕ Wins!' : 'You win! 🎉';
      els.resultDetail.textContent = 'Three in a row.';
    } else {
      state.losses++;
      els.resultTitle.textContent = state.twoPlayer ? '⬤ Wins!' : 'The machine wins 🤖';
      els.resultDetail.textContent = 'Better luck next round.';
    }

    updateHud();
    setTimeout(function () {
      Arcade.showOverlay('overlay-result');
    }, 650);
  }

  function newRound(flipStarter) {
    clearTimeout(aiTimer);
    if (flipStarter !== false) state.starter = state.starter === 'X' ? 'O' : 'X';
    state.board = new Array(9).fill('');
    state.over = false;
    state.mode = 'playing';
    state.turn = state.starter === 'O' && !state.twoPlayer ? 'X' : 'X';
    Arcade.hideOverlays();
    buildBoard();
    updateStatus();
    if (!state.twoPlayer && state.starter === 'O') {
      scheduleAi();
    }
  }

  function resetSeries() {
    state.wins = 0;
    state.draws = 0;
    state.losses = 0;
    state.starter = 'X';
    updateHud();
    newRound(false);
  }

  function setDifficulty(level) {
    state.difficulty = level;
    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.classList.toggle('active', b.dataset.level === level);
    });
  }

  function toggleMode() {
    state.twoPlayer = !state.twoPlayer;
    els.modeBtn.textContent = state.twoPlayer ? '👥 2-Player' : '🤖 vs AI';
    resetSeries();
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    for (var i = 0; i < 9; i++) {
      var btn = document.createElement('button');
      btn.className = 'ttt-cell';
      btn.dataset.index = String(i);
      btn.setAttribute('aria-label', 'Square ' + (i + 1));
      boardEl.appendChild(btn);
    }
  }

  function renderCell(i) {
    var el = boardEl.children[i];
    var v = state.board[i];
    if (!v) return;
    el.textContent = v === 'X' ? '✕' : '⬤';
    el.classList.add('taken', v.toLowerCase());
  }

  function updateStatus() {
    if (state.over) return;
    if (state.twoPlayer) {
      els.status.innerHTML = '<strong>' + (state.turn === 'X' ? '✕' : '⬤') + '</strong>\'s move';
    } else if (state.turn === 'X') {
      els.status.innerHTML = "Your move — you're ✕";
    } else {
      els.status.textContent = 'AI is thinking…';
    }
  }

  function updateHud() {
    els.wins.textContent = String(state.wins);
    els.draws.textContent = String(state.draws);
    els.losses.textContent = String(state.losses);
  }

  function init() {
    boardEl = document.getElementById('board');
    els = {
      status: document.getElementById('status'),
      wins: document.getElementById('wins'),
      draws: document.getElementById('draws'),
      losses: document.getElementById('losses'),
      modeBtn: document.getElementById('btn-mode'),
      resultTitle: document.getElementById('result-title'),
      resultDetail: document.getElementById('result-detail')
    };

    boardEl.addEventListener('click', function (e) {
      var cell = e.target.closest('.ttt-cell');
      if (!cell || state.twoPlayer === false && state.turn === 'O') return;
      place(Number(cell.dataset.index), state.turn);
    });

    document.getElementById('btn-next-round').addEventListener('click', function () {
      newRound(true);
    });
    document.getElementById('btn-reset').addEventListener('click', resetSeries);
    els.modeBtn.addEventListener('click', toggleMode);

    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.addEventListener('click', function () { setDifficulty(b.dataset.level); });
    });

    buildBoard();
    updateHud();
    updateStatus();
  }

  window.Game = {
    get state() { return state.mode; },
    get turn() { return state.turn; },
    get board() { return state.board.slice(); },
    get over() { return state.over; },
    get difficulty() { return state.difficulty; },
    get twoPlayer() { return state.twoPlayer; },
    get score() { return state.wins + ':' + state.losses + ' (' + state.draws + ' draws)'; },
    place: place,
    aiMove: aiMove,
    winnerOf: winnerOf,
    minimax: minimax,
    setDifficulty: setDifficulty,
    newRound: newRound,
    _debug: {
      flushAi: function () { clearTimeout(aiTimer); aiMove(); },
      seedBoard: function (cells) {
        clearTimeout(aiTimer);
        state.board = cells.slice();
        state.over = false;
        buildBoard();
        for (var i = 0; i < 9; i++) if (state.board[i]) renderCell(i);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
