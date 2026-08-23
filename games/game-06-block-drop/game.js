(function () {
  'use strict';

  var COLS = 10;
  var ROWS = 20;

  var SHAPES = {
    I: [[0, 1], [1, 1], [2, 1], [3, 1]],
    O: [[1, 0], [2, 0], [1, 1], [2, 1]],
    T: [[0, 1], [1, 1], [2, 1], [1, 0]],
    S: [[1, 0], [2, 0], [0, 1], [1, 1]],
    Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
    J: [[0, 0], [0, 1], [1, 1], [2, 1]],
    L: [[2, 0], [0, 1], [1, 1], [2, 1]]
  };
  var TYPES = Object.keys(SHAPES);
  var COLORS = {
    I: '#22d3ee', O: '#fbbf24', T: '#b78bff', S: '#34d399',
    Z: '#f87171', J: '#4f7cff', L: '#fb923c'
  };

  function rotateCells(cells, size, times) {
    var out = cells.map(function (c) { return [c[0], c[1]]; });
    for (var t = 0; t < ((times % 4) + 4) % 4; t++) {
      out = out.map(function (c) { return [size - 1 - c[1], c[0]]; });
    }
    return out;
  }

  var ROTATIONS = {};
  var SIZE_OF = { I: 4, O: 4 };
  TYPES.forEach(function (type) {
    var size = SIZE_OF[type] || 3;
    ROTATIONS[type] = [];
    for (var r = 0; r < 4; r++) ROTATIONS[type].push(rotateCells(SHAPES[type], size, r));
  });

  var KICKS = [0, -1, 1, -2, 2];

  var canvas = null;
  var ctx = null;
  var nextCanvas = null;
  var nextCtx = null;
  var els = {};
  var rafId = null;
  var lastTick = 0;

  var state = {
    mode: 'idle',
    board: [],
    piece: null,
    nextType: null,
    score: 0,
    lines: 0,
    level: 1,
    best: 0,
    softDropping: false
  };

  function emptyBoard() {
    var b = [];
    for (var r = 0; r < ROWS; r++) b.push(new Array(COLS).fill(0));
    return b;
  }

  function gravityInterval() {
    return Math.max(70, 800 - (state.level - 1) * 70);
  }

  function collides(board, type, rot, px, py) {
    var cells = ROTATIONS[type][((rot % 4) + 4) % 4];
    for (var i = 0; i < cells.length; i++) {
      var x = px + cells[i][0];
      var y = py + cells[i][1];
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
    return false;
  }

  function randomType() {
    return TYPES[Math.floor(Math.random() * TYPES.length)];
  }

  function newPiece(type) {
    var t = type || state.nextType || randomType();
    state.nextType = type ? randomType() : randomType();
    return { type: t, rot: 0, x: Math.floor(COLS / 2) - 2, y: -1 };
  }

  function spawn(type) {
    state.piece = newPiece(type);
    if (collides(state.board, state.piece.type, 0, state.piece.x, state.piece.y)) {
      gameOver();
    }
    drawNext();
  }

  function move(dx) {
    if (state.mode !== 'playing' || !state.piece) return false;
    var p = state.piece;
    if (!collides(state.board, p.type, p.rot, p.x + dx, p.y)) {
      p.x += dx;
      draw();
      return true;
    }
    return false;
  }

  function rotate(dir) {
    if (state.mode !== 'playing' || !state.piece) return false;
    var p = state.piece;
    var nr = (p.rot + (dir === 'cw' ? 1 : 3)) % 4;
    for (var k = 0; k < KICKS.length; k++) {
      if (!collides(state.board, p.type, nr, p.x + KICKS[k], p.y)) {
        p.rot = nr;
        p.x += KICKS[k];
        draw();
        return true;
      }
    }
    return false;
  }

  function dropDistance() {
    var p = state.piece;
    var d = 0;
    while (!collides(state.board, p.type, p.rot, p.x, p.y + d + 1)) d++;
    return d;
  }

  function softDrop() {
    if (state.mode !== 'playing' || !state.piece) return false;
    var p = state.piece;
    if (!collides(state.board, p.type, p.rot, p.x, p.y + 1)) {
      p.y++;
      state.score += 1;
      updateHud();
      draw();
      return true;
    }
    lockPiece();
    return true;
  }

  function hardDrop() {
    if (state.mode !== 'playing' || !state.piece) return false;
    var d = dropDistance();
    state.piece.y += d;
    state.score += d * 2;
    updateHud();
    lockPiece();
    return true;
  }

  function lockPiece() {
    var p = state.piece;
    if (!p) return;
    var cells = ROTATIONS[p.type][p.rot];
    for (var i = 0; i < cells.length; i++) {
      var x = p.x + cells[i][0];
      var y = p.y + cells[i][1];
      if (y >= 0) state.board[y][x] = COLORS[p.type];
    }
    clearLines();
    spawn();
  }

  function clearLines() {
    var full = [];
    for (var r = 0; r < ROWS; r++) {
      if (state.board[r].every(function (c) { return c !== 0; })) full.push(r);
    }
    for (var j = 0; j < full.length; j++) {
      state.board.splice(full[j], 1);
      state.board.unshift(new Array(COLS).fill(0));
    }
    var n = full.length;
    if (n > 0) {
      var table = [0, 100, 300, 500, 800];
      state.score += table[n] * state.level;
      state.lines += n;
      var newLevel = Math.floor(state.lines / 10) + 1;
      if (newLevel > state.level) state.level = newLevel;
      Arcade.audio.beep(600 + n * 120, 0.12, 'triangle');
      saveBest();
    }
    updateHud();
    return n;
  }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      Arcade.storage.set('blockdrop.best', state.best);
    }
  }

  function tickGravity() {
    if (!state.piece) return;
    var p = state.piece;
    if (!collides(state.board, p.type, p.rot, p.x, p.y + 1)) {
      p.y++;
      draw();
    } else {
      lockPiece();
    }
  }

  function start() {
    state.board = emptyBoard();
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.nextType = randomType();
    state.mode = 'playing';
    Arcade.hideOverlays();
    spawn();
    lastTick = performance.now();
    startLoop();
    updateHud();
  }

  function resetToIdle() {}

  function togglePause() {
    if (state.mode === 'playing') {
      state.mode = 'paused';
      stopLoop();
      Arcade.showOverlay('overlay-pause');
    } else if (state.mode === 'paused') {
      state.mode = 'playing';
      Arcade.hideOverlays();
      lastTick = performance.now();
      startLoop();
    }
  }

  function halt() {
    if (state.mode === 'playing') togglePause();
    else stopLoop();
  }

  function gameOver() {
    state.mode = 'game-over';
    stopLoop();
    saveBest();
    els.finalScore.textContent = String(state.score);
    els.finalLines.textContent = String(state.lines);
    var isBest = state.score > 0 && state.score >= state.best;
    els.newBest.classList.toggle('hidden', !isBest);
    Arcade.showOverlay('overlay-over');
    Arcade.audio.beep(110, 0.4, 'sawtooth', 0.15);
  }

  function startLoop() {
    stopLoop();
    lastTick = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (now - lastTick >= gravityInterval()) {
      lastTick = now;
      tickGravity();
    }
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.best.textContent = String(state.best);
    els.lines.textContent = String(state.lines);
    els.level.textContent = String(state.level);
  }

  function cellSize(canvasEl) {
    return canvasEl.width / COLS;
  }

  function drawBlock(c, x, y, s, color) {
    c.fillStyle = color;
    c.fillRect(x + 1, y + 1, s - 2, s - 2);
    c.fillStyle = 'rgba(255,255,255,.18)';
    c.fillRect(x + 1, y + 1, s - 2, 3);
  }

  function draw() {
    if (!ctx) return;
    var s = cellSize(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    for (var gx = 1; gx < COLS; gx++) {
      ctx.beginPath();
      ctx.moveTo(gx * s, 0);
      ctx.lineTo(gx * s, canvas.height);
      ctx.stroke();
    }
    for (var gy = 1; gy < ROWS; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, gy * s);
      ctx.lineTo(canvas.width, gy * s);
      ctx.stroke();
    }

    for (var r = 0; r < ROWS; r++) {
      for (var cx = 0; cx < COLS; cx++) {
        if (state.board[r][cx]) drawBlock(ctx, cx * s, r * s, s, state.board[r][cx]);
      }
    }

    var p = state.piece;
    if (p && (state.mode === 'playing' || state.mode === 'paused')) {
      var ghostY = p.y;
      while (!collides(state.board, p.type, p.rot, p.x, ghostY + 1)) ghostY++;
      var gcells = ROTATIONS[p.type][p.rot];
      ctx.fillStyle = 'rgba(232,236,255,.10)';
      for (var gi = 0; gi < gcells.length; gi++) {
        var gx2 = (p.x + gcells[gi][0]) * s;
        var gy2 = (ghostY + gcells[gi][1]) * s;
        if (gy2 >= 0) ctx.fillRect(gx2 + 1, gy2 + 1, s - 2, s - 2);
      }

      var cells = ROTATIONS[p.type][p.rot];
      var color = COLORS[p.type];
      for (var ci = 0; ci < cells.length; ci++) {
        var bx = (p.x + cells[ci][0]) * s;
        var by = (p.y + cells[ci][1]) * s;
        if (by >= 0) drawBlock(ctx, bx, by, s, color);
      }
    }
  }

  function drawNext() {
    if (!nextCtx || !state.nextType) return;
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    var cells = ROTATIONS[state.nextType][0];
    var s = 20;
    var minX = 3;
    var minY = 3;
    cells.forEach(function (c) {
      minX = Math.min(minX, c[0]);
      minY = Math.min(minY, c[1]);
    });
    var offX = (nextCanvas.width - 4 * s) / 2 - minX * s;
    var offY = (nextCanvas.height - 2 * s) / 2 - minY * s;
    cells.forEach(function (c) {
      drawBlock(nextCtx, offX + c[0] * s, offY + c[1] * s, s, COLORS[state.nextType]);
    });
  }

  function onKey(e) {
    if (e.type === 'keydown') {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move(-1); break;
        case 'ArrowRight': e.preventDefault(); move(1); break;
        case 'ArrowDown': case 's': e.preventDefault(); softDrop(); break;
        case 'ArrowUp': case 'x': case 'X': e.preventDefault(); rotate('cw'); break;
        case 'z': case 'Z': e.preventDefault(); rotate('ccw'); break;
        case ' ': e.preventDefault();
          if (state.mode === 'idle') start();
          else if (state.mode === 'playing') hardDrop();
          break;
        case 'p': case 'P': e.preventDefault(); togglePause(); break;
        case 'Enter':
          if (state.mode === 'game-over') start();
          break;
      }
    }
  }

  function init() {
    canvas = document.getElementById('well');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next');
    nextCtx = nextCanvas.getContext('2d');
    els = {
      score: document.getElementById('score'),
      best: document.getElementById('best'),
      lines: document.getElementById('lines'),
      level: document.getElementById('level'),
      finalScore: document.getElementById('final-score'),
      finalLines: document.getElementById('final-lines'),
      newBest: document.getElementById('new-best')
    };

    state.best = Arcade.storage.get('blockdrop.best', 0);
    state.board = emptyBoard();

    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', halt);

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-restart').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', togglePause);

    Array.prototype.forEach.call(document.querySelectorAll('.pad'), function (btn) {
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        switch (btn.dataset.act) {
          case 'left': move(-1); break;
          case 'right': move(1); break;
          case 'rotate': rotate('cw'); break;
          case 'down': softDrop(); break;
          case 'drop': hardDrop(); break;
        }
      });
    });

    updateHud();
    draw();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get lines() { return state.lines; },
    get level() { return state.level; },
    get nextType() { return state.nextType; },
    get piece() { return state.piece; },
    get gravityInterval() { return gravityInterval(); },
    grid: function () {
      return state.board.map(function (row) {
        return row.map(function (v) { return v ? 1 : 0; });
      });
    },
    start: start,
    moveLeft: function () { return move(-1); },
    moveRight: function () { return move(1); },
    softDrop: softDrop,
    hardDrop: hardDrop,
    rotateCW: function () { return rotate('cw'); },
    rotateCCW: function () { return rotate('ccw'); },
    togglePause: togglePause,
    halt: halt,
    draw: draw,
    _debug: {
      spawn: function (type) { spawn(type); },
      setCell: function (r, c, v) {
        state.board[r][c] = v ? COLORS.T : 0;
      },
      fillRow: function (r, exceptCols) {
        exceptCols = exceptCols || [];
        for (var c = 0; c < COLS; c++) {
          if (exceptCols.indexOf(c) === -1) state.board[r][c] = COLORS.Z;
        }
      },
      addLines: function (n) {
        state.lines += n;
        state.level = Math.floor(state.lines / 10) + 1;
        updateHud();
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
