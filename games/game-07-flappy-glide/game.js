(function () {
  'use strict';

  var W = 480;
  var H = 600;
  var FLOOR = H - 40;
  var R = 14;
  var GRAVITY = 0.0011;
  var FLAP_V = -0.36;
  var PIPE_W = 62;
  var SPAWN_MS = 1500;

  var canvas = null;
  var ctx = null;
  var els = {};
  var rafId = null;
  var lastFrame = 0;
  var spawnTimer = 0;

  var state = {
    mode: 'idle',
    bird: { x: 140, y: H / 2, v: 0 },
    pipes: [],
    score: 0,
    best: 0,
    scroll: 0
  };

  function speed() {
    return Math.min(0.30, 0.16 + state.score * 0.002);
  }

  function gapHeight() {
    return Math.max(120, 190 - state.score * 1.4);
  }

  function medalFor(score) {
    if (score >= 50) return '🥇 Gold';
    if (score >= 25) return '🥈 Silver';
    if (score >= 10) return '🥉 Bronze';
    return '';
  }

  function reset() {
    state.bird.y = H / 2;
    state.bird.v = 0;
    state.pipes = [];
    state.score = 0;
    spawnTimer = SPAWN_MS * 0.6;
    updateHud();
  }

  function start() {
    reset();
    state.mode = 'playing';
    Arcade.hideOverlays();
    lastFrame = performance.now();
    startLoop();
  }

  function flap() {
    if (state.mode === 'idle') { start(); return true; }
    if (state.mode !== 'playing') return false;
    state.bird.v = FLAP_V;
    Arcade.audio.beep(520, 0.05, 'sine', 0.08);
    return true;
  }

  function spawnPipe() {
    var margin = 46;
    var gh = gapHeight();
    var gy = margin + Math.random() * (FLOOR - margin * 2 - gh);
    state.pipes.push({ x: W + PIPE_W, gapY: gy, gapH: gh, passed: false });
  }

  function circleHitsRect(cx, cy, r, rx, ry, rw, rh) {
    var nx = Math.max(rx, Math.min(cx, rx + rw));
    var ny = Math.max(ry, Math.min(cy, ry + rh));
    var dx = cx - nx;
    var dy = cy - ny;
    return dx * dx + dy * dy < r * r;
  }

  function update(dtMs) {
    if (state.mode !== 'playing') return false;

    var b = state.bird;
    b.v += GRAVITY * dtMs;
    b.y += b.v * dtMs;
    if (b.y < R) { b.y = R; b.v = 0; }

    var sp = speed();
    spawnTimer -= dtMs;
    if (spawnTimer <= 0) {
      spawnPipe();
      spawnTimer = (SPAWN_MS * (0.16 / sp)) | 0;
    }

    for (var i = state.pipes.length - 1; i >= 0; i--) {
      var p = state.pipes[i];
      p.x -= sp * dtMs;

      if (!p.passed && p.x + PIPE_W < b.x - R) {
        p.passed = true;
        state.score++;
        updateHud();
      }

      if (circleHitsRect(b.x, b.y, R, p.x, 0, PIPE_W, p.gapY) ||
          circleHitsRect(b.x, b.y, R, p.x, p.gapY + p.gapH, PIPE_W, FLOOR)) {
        die();
        return true;
      }

      if (p.x + PIPE_W < -4) state.pipes.splice(i, 1);
    }

    if (b.y + R >= FLOOR) {
      b.y = FLOOR - R;
      die();
      return true;
    }

    state.scroll += sp * dtMs;
    draw();
    return true;
  }

  function die() {
    state.mode = 'game-over';
    stopLoop();
    saveBest();
    els.finalScore.textContent = String(state.score);
    els.finalBest.textContent = String(state.best);
    els.medalText.textContent = medalFor(state.score);
    updateHud();
    Arcade.showOverlay('overlay-over');
    Arcade.audio.beep(160, 0.25, 'square', 0.12);
  }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      Arcade.storage.set('flappy.best', state.best);
    }
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
    var dt = Math.min(34, now - lastFrame);
    lastFrame = now;
    update(dt);
  }

  function medalLabel(score) {
    var m = medalFor(score);
    return m === '' ? '—' : m.split(' ')[0];
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.best.textContent = String(state.best);
    els.medal.textContent = medalLabel(state.score);
  }

  function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.arc(x + s, y + s * 0.3, s * 0.8, 0, Math.PI * 2);
    ctx.arc(x - s, y + s * 0.3, s * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,.14)';
    var off = -(state.scroll * 0.2) % 160;
    for (var layer = 0; layer < 5; layer++) {
      drawCloud(off + layer * 170, 80 + (layer % 3) * 60, 16 + (layer % 2) * 8);
    }

    for (var i = 0; i < state.pipes.length; i++) {
      var p = state.pipes[i];
      ctx.fillStyle = '#34d399';
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
      ctx.fillRect(p.x, p.gapY + p.gapH, PIPE_W, FLOOR - p.gapY - p.gapH);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(p.x, p.gapY - 8, PIPE_W, 8);
      ctx.fillRect(p.x, p.gapY + p.gapH, PIPE_W, 8);
    }

    ctx.fillStyle = '#c9a15a';
    ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = '#b58f49';
    var groundOff = -(state.scroll % 24);
    for (var g = 0; g < W / 24 + 2; g++) {
      ctx.fillRect(groundOff + g * 24, FLOOR, 12, 6);
    }

    var rot = Math.max(-0.5, Math.min(1.1, state.bird.v * 2.4));
    ctx.save();
    ctx.translate(state.bird.x, state.bird.y);
    ctx.rotate(rot);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(6, -5, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(7.4, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(R - 4, 2, 9, 4);
    ctx.restore();

    ctx.fillStyle = 'rgba(232,236,255,.9)';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(String(state.score), W / 2 - 12, 64);
  }

  function onKey(e) {
    if (e.type !== 'keydown') return;
    if (e.key === ' ') {
      e.preventDefault();
      flap();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePause();
    } else if (e.key === 'r' || e.key === 'R') {
      if (state.mode === 'game-over') start();
    }
  }

  function init() {
    canvas = document.getElementById('sky');
    ctx = canvas.getContext('2d');
    els = {
      score: document.getElementById('score'),
      best: document.getElementById('best'),
      medal: document.getElementById('medal'),
      finalScore: document.getElementById('final-score'),
      finalBest: document.getElementById('final-best'),
      medalText: document.getElementById('medal-text')
    };

    state.best = Arcade.storage.get('flappy.best', 0);

    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', halt);

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-retry').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', togglePause);

    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      flap();
    });

    updateHud();
    draw();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get best() { return state.best; },
    get bird() { return state.bird; },
    get pipes() { return state.pipes; },
    get speed() { return speed(); },
    get gapHeight() { return gapHeight(); },
    flap: flap,
    start: start,
    update: update,
    togglePause: togglePause,
    halt: halt,
    draw: draw,
    _debug: {
      clearPipes: function () { state.pipes.length = 0; },
      setScore: function (n) { state.score = n; },
      addPipeAt: function (x, gapY, gapH) {
        state.pipes.push({ x: x, gapY: gapY, gapH: gapH, passed: false });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
