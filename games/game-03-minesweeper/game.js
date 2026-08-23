(function () {
  'use strict';

  var LEVELS = {
    beginner: { cols: 9, rows: 9, mines: 10 },
    intermediate: { cols: 16, rows: 16, mines: 40 }
  };

  var boardEl = null;
  var els = {};
  var timerId = null;
  var longPressTimer = null;

  var state = {
    mode: 'idle',
    level: 'beginner',
    grid: [],
    cols: 9,
    rows: 9,
    mines: 10,
    revealedCount: 0,
    flagCount: 0,
    seconds: 0,
    firstClickDone: false,
    flagMode: false,
    best: null
  };

  function total() { return state.cols * state.rows; }

  function neighbors(i) {
    var x = i % state.cols;
    var y = Math.floor(i / state.cols);
    var out = [];
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        var nx = x + dx;
        var ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < state.cols && ny < state.rows) {
          out.push(ny * state.cols + nx);
        }
      }
    }
    return out;
  }

  function storageKey() { return 'minesweeper.best.' + state.level; }

  function emptyGrid() {
    state.grid = [];
    for (var i = 0; i < total(); i++) {
      state.grid.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
    }
  }

  var pendingForced = null;

  function placeMines(safeIndex) {
    if (pendingForced) {
      var forced = pendingForced;
      pendingForced = null;
      for (var f = 0; f < total(); f++) {
        state.grid[f].mine = forced.indexOf(f) !== -1;
      }
    } else {
      var candidates = [];
      for (var c = 0; c < total(); c++) {
        if (c !== safeIndex) candidates.push(c);
      }
      for (var m = 0; m < state.mines; m++) {
        var pick = Math.floor(Math.random() * candidates.length);
        state.grid[candidates[pick]].mine = true;
        candidates.splice(pick, 1);
      }
    }
    for (var i = 0; i < total(); i++) {
      var n = 0;
      if (!state.grid[i].mine) {
        neighbors(i).forEach(function (j) {
          if (state.grid[j].mine) n++;
        });
      }
      state.grid[i].adjacent = n;
    }
  }

  function reset() {
    stopTimer();
    state.seconds = 0;
    state.revealedCount = 0;
    state.flagCount = 0;
    state.firstClickDone = false;
    state.mode = 'idle';
    state.best = Arcade.storage.get(storageKey(), null);
    emptyGrid();
    els.banner.classList.add('hidden');
    els.face.textContent = '🙂 New';
    render();
    updateHud();
  }

  function setDifficulty(level) {
    var cfg = LEVELS[level];
    state.level = level;
    state.cols = cfg.cols;
    state.rows = cfg.rows;
    state.mines = cfg.mines;
    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.classList.toggle('active', b.dataset.level === level);
    });
    reset();
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
      state.seconds++;
      els.time.textContent = String(state.seconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function revealAt(i) {
    if (state.mode === 'won' || state.mode === 'lost') return false;
    if (i < 0 || i >= total()) return false;
    var cell = state.grid[i];
    if (cell.revealed || cell.flagged) return false;

    if (!state.firstClickDone) {
      placeMines(i, null);
      state.firstClickDone = true;
      state.mode = 'playing';
      startTimer();
    }
    if (cell.mine) {
      explode(i);
      return true;
    }
    floodReveal(i);
    checkWin();
    return true;
  }

  function floodReveal(start) {
    var queue = [start];
    while (queue.length) {
      var i = queue.pop();
      var cell = state.grid[i];
      if (cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      state.revealedCount++;
      paintCell(i);
      if (cell.adjacent === 0) {
        neighbors(i).forEach(function (j) {
          if (!state.grid[j].revealed && !state.grid[j].flagged) queue.push(j);
        });
      }
    }
  }

  function flagAt(i) {
    if (state.mode === 'won' || state.mode === 'lost') return false;
    var cell = state.grid[i];
    if (cell.revealed) return false;
    cell.flagged = !cell.flagged;
    state.flagCount += cell.flagged ? 1 : -1;
    paintCell(i);
    updateHud();
    return true;
  }

  function explode(hitIndex) {
    state.mode = 'lost';
    stopTimer();
    state.grid.forEach(function (c, idx) {
      if (c.mine) c.revealed = true;
    });
    paintAll();
    var el = boardEl.children[hitIndex];
    el.classList.add('exploded');
    el.textContent = '💥';
    els.face.textContent = '😵 New';
    showBanner(false);
    Arcade.audio.beep(120, 0.4, 'sawtooth', 0.15);
  }

  function checkWin() {
    if (state.revealedCount === total() - state.mines) {
      state.mode = 'won';
      stopTimer();
      var isBest = state.best === null || state.seconds < state.best;
      if (isBest) {
        state.best = state.seconds;
        Arcade.storage.set(storageKey(), state.best);
      }
      updateHud();
      els.face.textContent = '🎉 New';
      showBanner(true);
      Arcade.audio.beep(880, 0.3, 'triangle');
    }
  }

  function showBanner(won) {
    els.banner.textContent = won
      ? '🎉 Cleared in ' + state.seconds + 's!'
      : '💀 Boom! Better luck next time.';
    els.banner.className = 'banner ' + (won ? 'win' : 'lose');
  }

  function paintCell(i) {
    var el = boardEl.children[i];
    var cell = state.grid[i];
    el.className = 'ms-cell';
    el.textContent = '';
    if (cell.revealed) {
      el.classList.add('revealed');
      if (cell.adjacent > 0) {
        el.classList.add('n' + cell.adjacent);
        el.textContent = String(cell.adjacent);
      } else if (cell.mine) {
        el.textContent = '💣';
      }
    } else if (cell.flagged) {
      el.classList.add('flagged');
      el.textContent = '🚩';
    }
  }

  function paintAll() {
    for (var i = 0; i < total(); i++) paintCell(i);
  }

  function render() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = 'repeat(' + state.cols + ', auto)';
    boardEl.style.maxWidth = '100%';
    for (var i = 0; i < total(); i++) {
      var btn = document.createElement('button');
      btn.className = 'ms-cell';
      btn.dataset.index = String(i);
      btn.setAttribute('aria-label', 'Cell ' + (i + 1));
      boardEl.appendChild(btn);
    }
  }

  function updateHud() {
    els.mines.textContent = String(state.mines - state.flagCount);
    els.time.textContent = String(state.seconds);
    els.best.textContent = state.best === null ? '—' : state.best + 's';
  }

  function toggleFlagMode(force) {
    state.flagMode = force != null ? force : !state.flagMode;
    els.flagModeBtn.classList.toggle('active', state.flagMode);
    els.flagModeBtn.setAttribute('aria-pressed', String(state.flagMode));
  }

  function onCellClick(e) {
    var btn = e.target.closest('.ms-cell');
    if (!btn) return;
    var i = Number(btn.dataset.index);
    if (state.flagMode) flagAt(i);
    else revealAt(i);
  }

  function onContextMenu(e) {
    e.preventDefault();
    var btn = e.target.closest('.ms-cell');
    if (btn) flagAt(Number(btn.dataset.index));
  }

  function onPointerDown(e) {
    var btn = e.target.closest('.ms-cell');
    if (!btn || e.pointerType === 'mouse') return;
    longPressTimer = setTimeout(function () {
      flagAt(Number(btn.dataset.index));
      longPressTimer = 'consumed';
    }, 450);
  }

  function onPointerUp() {
    if (longPressTimer && longPressTimer !== 'consumed') clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  function init() {
    boardEl = document.getElementById('board');
    els = {
      mines: document.getElementById('mines'),
      time: document.getElementById('time'),
      best: document.getElementById('best'),
      face: document.getElementById('btn-face'),
      banner: document.getElementById('banner'),
      flagModeBtn: document.getElementById('btn-flagmode')
    };

    boardEl.addEventListener('click', onCellClick);
    boardEl.addEventListener('contextmenu', onContextMenu);
    boardEl.addEventListener('pointerdown', onPointerDown);
    boardEl.addEventListener('pointerup', onPointerUp);
    boardEl.addEventListener('pointercancel', onPointerUp);

    els.face.addEventListener('click', reset);
    els.flagModeBtn.addEventListener('click', function () { toggleFlagMode(); });

    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.addEventListener('click', function () { setDifficulty(b.dataset.level); });
    });

    reset();
  }

  window.Game = {
    get state() { return state.mode; },
    get grid() { return state.grid; },
    get minesLeft() { return state.mines - state.flagCount; },
    get flags() { return state.flagCount; },
    get seconds() { return state.seconds; },
    get cols() { return state.cols; },
    get rows() { return state.rows; },
    get levelName() { return state.level; },
    revealAt: revealAt,
    flagAt: flagAt,
    reset: reset,
    setDifficulty: setDifficulty,
    _debug: {
      seedMines: function (indices) { pendingForced = indices.slice(); },
      neighbors: neighbors
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
