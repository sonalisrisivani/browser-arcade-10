(function () {
  'use strict';

  var COLS = 21;
  var ROWS = 21;
  var BASE_INTERVAL = 150;
  var MIN_INTERVAL = 60;

  var DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  var canvas = null;
  var ctx = null;
  var els = {};
  var rafId = null;
  var lastTick = 0;

  var state = {
    mode: 'idle',
    snake: [],
    dir: 'right',
    queue: [],
    food: null,
    score: 0,
    foodsEaten: 0,
    best: 0
  };

  function level() { return Math.floor(state.foodsEaten / 5) + 1; }
  function interval() { return Math.max(MIN_INTERVAL, BASE_INTERVAL - (level() - 1) * 15); }

  function reset() {
    var cx = Math.floor(COLS / 2);
    var cy = Math.floor(ROWS / 2);
    state.snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
    state.dir = 'right';
    state.queue = [];
    state.score = 0;
    state.foodsEaten = 0;
    placeFood();
    updateHud();
  }

  function occupied(x, y) {
    for (var i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x === x && state.snake[i].y === y) return true;
    }
    return false;
  }

  function placeFood(x, y) {
    if (x != null && y != null && !occupied(x, y)) {
      state.food = { x: x, y: y };
      return;
    }
    var free = [];
    for (var i = 0; i < COLS * ROWS; i++) {
      var fx = i % COLS;
      var fy = Math.floor(i / COLS);
      if (!occupied(fx, fy)) free.push({ x: fx, y: fy });
    }
    state.food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }

  function setDir(dir) {
    if (!DIRS[dir]) return;
    if (state.mode !== 'running') return;
    var last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
    if (DIRS[dir].x === -DIRS[last].x && DIRS[dir].y === -DIRS[last].y) return;
    if (dir === last) return;
    if (state.queue.length < 3) state.queue.push(dir);
  }

  function step() {
    if (state.mode !== 'running') return false;
    if (state.queue.length) state.dir = state.queue.shift();
    var d = DIRS[state.dir];
    var head = { x: state.snake[0].x + d.x, y: state.snake[0].y + d.y };

    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
      gameOver('wall');
      return false;
    }
    for (var i = 0; i < state.snake.length - 1; i++) {
      if (state.snake[i].x === head.x && state.snake[i].y === head.y) {
        gameOver('self');
        return false;
      }
    }

    state.snake.unshift(head);

    if (state.food && head.x === state.food.x && head.y === state.food.y) {
      state.score += 10 * level();
      state.foodsEaten++;
      Arcade.audio.beep(520 + level() * 40, 0.08, 'triangle');
      placeFood();
      updateHud();
    } else {
      state.snake.pop();
    }
    return true;
  }

  function gameOver(cause) {
    state.mode = 'game-over';
    stopLoop();
    var isBest = state.score > 0 && state.score > state.best;
    if (isBest) {
      state.best = state.score;
      Arcade.storage.set('snake.best', state.best);
    }
    els.finalScore.textContent = String(state.score);
    els.finalLength.textContent = String(state.snake.length);
    els.overTitle.textContent = cause === 'wall' ? 'You hit the wall!' : 'You bit yourself!';
    els.newBest.classList.toggle('hidden', !isBest);
    els.best.textContent = String(state.best);
    Arcade.showOverlay('overlay-over');
  }

  function start() {
    reset();
    state.mode = 'running';
    Arcade.hideOverlays();
    startLoop();
  }

  function togglePause() {
    if (state.mode === 'running') {
      state.mode = 'paused';
      stopLoop();
      Arcade.showOverlay('overlay-pause');
    } else if (state.mode === 'paused') {
      state.mode = 'running';
      Arcade.hideOverlays();
      lastTick = performance.now();
      startLoop();
    }
  }

  function halt() {
    if (state.mode === 'running') togglePause();
    else { stopLoop(); }
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
    if (now - lastTick >= interval()) {
      lastTick = now;
      step();
      draw();
    }
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.level.textContent = String(level());
    els.best.textContent = String(state.best);
  }

  function draw() {
    if (!ctx) return;
    var cell = canvas.width / COLS;
    ctx.fillStyle = '#111527';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (var gx = 1; gx < COLS; gx++) ctx.fillRect(gx * cell - 1, 0, 1, canvas.height);
    for (var gy = 1; gy < ROWS; gy++) ctx.fillRect(0, gy * cell - 1, canvas.width, 1);

    if (state.food) {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(
        (state.food.x + 0.5) * cell,
        (state.food.y + 0.5) * cell,
        cell * 0.32, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    for (var i = state.snake.length - 1; i >= 0; i--) {
      var seg = state.snake[i];
      var t = i / Math.max(1, state.snake.length - 1);
      ctx.save();
      if (i === 0) {
        ctx.shadowColor = '#4f7cff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#7ea0ff';
      } else {
        var r = Math.round(79 + t * 30);
        var g = Math.round(124 + t * 20);
        var b = Math.round(255 - t * 60);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      }
      roundRect(ctx, seg.x * cell + 1.5, seg.y * cell + 1.5, cell - 3, cell - 3, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  var KEY_DIR = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right'
  };

  function onKey(e) {
    if (KEY_DIR[e.key]) {
      e.preventDefault();
      setDir(KEY_DIR[e.key]);
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (state.mode === 'idle') start();
      else togglePause();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.mode !== 'running' && state.mode !== 'paused') start();
    }
  }

  function init() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    els = {
      score: document.getElementById('score'),
      best: document.getElementById('best'),
      level: document.getElementById('level'),
      finalScore: document.getElementById('final-score'),
      finalLength: document.getElementById('final-length'),
      overTitle: document.getElementById('over-title'),
      newBest: document.getElementById('new-best')
    };
    state.best = Arcade.storage.get('snake.best', 0);

    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', halt);

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-restart').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', togglePause);

    Array.prototype.forEach.call(document.querySelectorAll('.pad'), function (btn) {
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        setDir(btn.getAttribute('data-dir'));
      });
    });

    reset();
    draw();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get snake() { return state.snake; },
    get food() { return state.food; },
    get level() { return level(); },
    start: start,
    reset: reset,
    step: step,
    setDir: setDir,
    togglePause: togglePause,
    halt: halt,
    placeFood: placeFood,
    draw: draw,
    COLS: COLS,
    ROWS: ROWS,
    interval: interval
  };

  document.addEventListener('DOMContentLoaded', init);
})();
