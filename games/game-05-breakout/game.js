(function () {
  'use strict';

  var W = 480;
  var H = 600;
  var PADDLE_W = 84;
  var PADDLE_H = 12;
  var BALL_R = 7;
  var BASE_SPEED = 0.32;
  var LEVELS = 3;

  var canvas = null;
  var ctx = null;
  var els = {};
  var rafId = null;
  var lastFrame = 0;
  var keys = { left: false, right: false };

  var state = {
    mode: 'idle',
    score: 0,
    lives: 3,
    level: 1,
    combo: 0,
    paddleX: W / 2,
    ball: { x: W / 2, y: H - 60, vx: 0, vy: 0, speed: BASE_SPEED },
    bricks: [],
    stuck: true
  };

  function brickLayout(level) {
    var rows = 3 + level;
    var cols = 8;
    var top = 70;
    var bw = (W - 40) / cols;
    var bh = 20;
    var out = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        out.push({
          x: 20 + c * bw,
          y: top + r * (bh + 6),
          w: bw - 6,
          h: bh,
          row: r,
          alive: true,
          points: (rows - r) * 10
        });
      }
    }
    return out;
  }

  function reset(full) {
    if (full) {
      state.score = 0;
      state.lives = 3;
      state.level = 1;
    }
    state.combo = 0;
    state.bricks = brickLayout(state.level);
    state.ball.speed = BASE_SPEED + (state.level - 1) * 0.06;
    stickBall();
    state.mode = 'ready';
    stopLoop();
    updateHud();
    draw();
  }

  function startGame() {
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    Arcade.hideOverlays();
    reset(false);
  }

  function stickBall() {
    state.stuck = true;
    state.ball.x = state.paddleX;
    state.ball.y = H - 46;
    state.ball.vx = 0;
    state.ball.vy = 0;
  }

  function launch(angleDeg) {
    if (state.mode !== 'ready') return false;
    var a = (angleDeg == null ? (Math.random() * 50 - 25) : angleDeg) * Math.PI / 180;
    state.ball.vx = Math.sin(a) * state.ball.speed;
    state.ball.vy = -Math.cos(a) * state.ball.speed;
    state.stuck = false;
    state.mode = 'playing';
    Arcade.hideOverlays();
    startLoop();
    return true;
  }

  function setPaddle(x) {
    state.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
    if (state.stuck) state.ball.x = state.paddleX;
  }

  function movePaddle(dir, dt) {
    var v = 0.55 * (dt || 16);
    if (dir === 'left') setPaddle(state.paddleX - v);
    else if (dir === 'right') setPaddle(state.paddleX + v);
  }

  function update(dtMs) {
    if (state.mode === 'ready') {
      applyKeys(dtMs);
      stickBall();
      draw();
      return true;
    }
    if (state.mode !== 'playing') return false;
    var steps = Math.max(1, Math.ceil(dtMs / 4));
    var sub = dtMs / steps;
    for (var i = 0; i < steps; i++) {
      applyKeys(sub);
      step(sub);
    }
    if (state.mode === 'playing') draw();
    return true;
  }

  function applyKeys(dt) {
    if (keys.left) movePaddle('left', dt);
    if (keys.right) movePaddle('right', dt);
  }

  function step(dt) {
    var b = state.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx); }
    if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx); }
    if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy); }

    var py = H - 34;
    if (b.vy > 0 && b.y >= py - BALL_R && b.y <= py + PADDLE_H &&
        b.x >= state.paddleX - PADDLE_W / 2 - BALL_R &&
        b.x <= state.paddleX + PADDLE_W / 2 + BALL_R) {
      var hit = (b.x - state.paddleX) / (PADDLE_W / 2);
      hit = Math.max(-1, Math.min(1, hit));
      var angle = hit * 60 * Math.PI / 180;
      b.speed = Math.min(0.75, b.speed + 0.004);
      b.vx = Math.sin(angle) * b.speed;
      b.vy = -Math.cos(angle) * b.speed;
      b.y = py - BALL_R - 1;
      state.combo = 0;
      updateHud();
    }

    if (b.y > H + 2 * BALL_R) {
      loseLife();
      return;
    }

    for (var i = 0; i < state.bricks.length; i++) {
      var k = state.bricks[i];
      if (!k.alive) continue;
      if (b.x + BALL_R > k.x && b.x - BALL_R < k.x + k.w &&
          b.y + BALL_R > k.y && b.y - BALL_R < k.y + k.h) {
        k.alive = false;
        var fromLeft = b.x < k.x;
        var fromRight = b.x > k.x + k.w;
        if (fromLeft || fromRight) b.vx = -b.vx;
        else b.vy = -b.vy;
        state.combo++;
        state.score += k.points + (state.combo - 1) * 5;
        Arcade.audio.beep(400 + state.combo * 40, 0.05, 'square', 0.07);
        updateHud();
        break;
      }
    }

    if (state.bricks.every(function (k) { return !k.alive; })) {
      levelCleared();
    }
  }

  function loseLife() {
    state.lives--;
    state.combo = 0;
    if (state.lives <= 0) {
      endGame(false);
    } else {
      state.mode = 'ready';
      stopLoop();
      stickBall();
      updateHud();
      draw();
    }
  }

  function levelCleared() {
    stopLoop();
    if (state.level >= LEVELS) {
      endGame(true);
      return;
    }
    state.mode = 'level-clear';
    els.levelScore.textContent = String(state.score);
    els.levelTitle.textContent = 'Level ' + state.level + ' Cleared!';
    Arcade.showOverlay('overlay-level');
    Arcade.audio.beep(700, 0.2, 'triangle');
  }

  function nextLevel() {
    state.level++;
    reset(false);
    Arcade.hideOverlays();
    state.mode = 'ready';
  }

  function endGame(victory) {
    state.mode = victory ? 'victory' : 'over';
    stopLoop();
    if (victory) {
      state.score += state.lives * 250;
      Arcade.audio.beep(980, 0.35, 'triangle');
    } else {
      Arcade.audio.beep(120, 0.4, 'sawtooth', 0.15);
    }
    saveBest();
    els.endTitle.textContent = victory ? '🏆 Victory!' : 'Game Over';
    els.endScore.textContent = String(state.score);
    updateHud();
    Arcade.showOverlay('overlay-end');
  }

  function saveBest() {
    var best = Arcade.storage.get('breakout.best', 0);
    if (state.score > best) Arcade.storage.set('breakout.best', state.score);
  }

  function togglePause() {
    if (state.mode === 'playing') {
      state.mode = 'paused';
      stopLoop();
      Arcade.showOverlay('overlay-pause');
    } else if (state.mode === 'paused') {
      state.mode = 'playing';
      Arcade.hideOverlays();
      lastFrame = performance.now();
      startLoop();
    }
  }

  function halt() {
    if (state.mode === 'playing') togglePause();
    else stopLoop();
  }

  function startLoop() {
    stopLoop();
    lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    var dt = Math.min(32, now - lastFrame);
    lastFrame = now;
    update(dt);
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.lives.textContent = new Array(Math.max(0, state.lives) + 1).join('♥');
    els.level.textContent = state.level + '/' + LEVELS;
    els.combo.textContent = '×' + Math.max(1, state.combo);
  }

  var COLORS = ['#f87171', '#fbbf24', '#34d399', '#22d3ee', '#4f7cff', '#b78bff'];

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < state.bricks.length; i++) {
      var k = state.bricks[i];
      if (!k.alive) continue;
      ctx.fillStyle = COLORS[k.row % COLORS.length];
      ctx.fillRect(k.x, k.y, k.w, k.h);
    }

    ctx.fillStyle = '#e8ecff';
    ctx.fillRect(state.paddleX - PADDLE_W / 2, H - 34, PADDLE_W, PADDLE_H);

    ctx.save();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(232,236,255,.45)';
    ctx.font = '14px monospace';
    ctx.fillText('combo ×' + Math.max(1, state.combo), 12, H - 10);
  }

  function onKey(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = e.type === 'keydown';
    else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = e.type === 'keydown';
    else if (e.key === ' ' && e.type === 'keydown') {
      e.preventDefault();
      if (state.mode === 'idle') startGame();
      else if (state.mode === 'ready') launch();
      else togglePause();
    } else if ((e.key === 'Enter') && e.type === 'keydown' &&
               (state.mode === 'over' || state.mode === 'victory')) {
      startGame();
    }
  }

  function init() {
    canvas = document.getElementById('stage');
    ctx = canvas.getContext('2d');
    els = {
      score: document.getElementById('score'),
      lives: document.getElementById('lives'),
      level: document.getElementById('level'),
      combo: document.getElementById('combo'),
      levelScore: document.getElementById('level-score'),
      levelTitle: document.getElementById('level-title'),
      endTitle: document.getElementById('end-title'),
      endScore: document.getElementById('end-score')
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);
    window.addEventListener('blur', halt);

    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-retry').addEventListener('click', startGame);
    document.getElementById('btn-resume').addEventListener('click', togglePause);
    document.getElementById('btn-next').addEventListener('click', nextLevel);

    function pointerX(e) {
      var rect = canvas.getBoundingClientRect();
      return (e.clientX - rect.left) * (W / rect.width);
    }
    canvas.addEventListener('pointermove', function (e) { setPaddle(pointerX(e)); });
    canvas.addEventListener('pointerdown', function (e) {
      setPaddle(pointerX(e));
      if (state.mode === 'ready') launch();
    });

    state.bricks = brickLayout(1);
    stickBall();
    updateHud();
    draw();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get lives() { return state.lives; },
    get level() { return state.level; },
    get combo() { return state.combo; },
    get bricksLeft() { return state.bricks.filter(function (k) { return k.alive; }).length; },
    get ball() { return state.ball; },
    get bricks() { return state.bricks; },
    get paddleX() { return state.paddleX; },
    get stuck() { return state.stuck; },
    start: startGame,
    launch: launch,
    update: update,
    setPaddle: setPaddle,
    movePaddle: movePaddle,
    togglePause: togglePause,
    nextLevel: nextLevel,
    halt: halt,
    draw: draw,
    _debug: {
      clearBricks: function () {
        state.bricks.forEach(function (k) { k.alive = false; });
      },
      placeBall: function (x, y, vx, vy) {
        state.ball.x = x;
        state.ball.y = y;
        state.ball.vx = vx;
        state.ball.vy = vy;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
