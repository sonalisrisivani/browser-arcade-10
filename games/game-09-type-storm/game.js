(function () {
  'use strict';

  var WORDS = ['time', 'year', 'people', 'way', 'day', 'man', 'thing', 'woman',
    'life', 'child', 'world', 'school', 'state', 'family', 'student', 'group',
    'country', 'problem', 'hand', 'part', 'place', 'case', 'week', 'company',
    'system', 'program', 'question', 'work', 'government', 'number', 'night',
    'point', 'home', 'water', 'room', 'mother', 'area', 'money', 'story',
    'fact', 'month', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word',
    'business', 'issue', 'side', 'kind', 'head', 'house', 'service', 'friend',
    'father', 'power', 'hour', 'game', 'line', 'end', 'member', 'law', 'car',
    'city', 'name', 'team', 'minute', 'idea', 'body', 'back', 'parent', 'face',
    'level', 'office', 'door', 'health', 'person', 'art', 'war', 'history',
    'party', 'result', 'change', 'morning', 'reason', 'research', 'girl',
    'guy', 'moment', 'air', 'teacher', 'force', 'education', 'storm', 'type'];

  var FIELD_H = 460;
  var FLOOR_Y = 420;
  var BASE_SPEED = 0.045;
  var SPAWN_MS = 2100;
  var COUNTDOWN_MS = 500;

  var fieldEl = null;
  var els = {};
  var rafId = null;
  var lastFrame = 0;
  var spawnTimer = 0;
  var countdownTimer = null;
  var startedAt = 0;
  var playedMs = 0;

  var state = {
    mode: 'idle',
    words: [],
    nextId: 1,
    score: 0,
    lives: 3,
    level: 1,
    streak: 0,
    bestStreak: 0,
    correctChars: 0,
    errorChars: 0,
    destroyed: 0,
    activeId: null
  };

  function levelSpeedMult() { return 1 + (state.level - 1) * 0.22; }
  function levelSpawnMs() { return Math.max(700, SPAWN_MS - (state.level - 1) * 180); }

  function accuracyPct() {
    var total = state.correctChars + state.errorChars;
    return total === 0 ? 100 : Math.round((state.correctChars / total) * 100);
  }

  function wpm() {
    if (playedMs < 2000) return 0;
    return Math.round((state.correctChars / 5) / (playedMs / 60000));
  }

  function pickWord() {
    var existing = {};
    state.words.forEach(function (w) { existing[w.text] = true; });
    for (var tries = 0; tries < 20; tries++) {
      var candidate = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (!existing[candidate]) {
        var firstLetter = candidate[0];
        var letterTaken = state.words.some(function (w) {
          return w.text[0] === firstLetter;
        });
        if (!letterTaken || tries > 10) return candidate;
      }
    }
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function spawn(text, xPct, speedOverride) {
    var w = {
      id: state.nextId++,
      text: text || pickWord(),
      typed: 0,
      xPct: xPct == null ? 8 + Math.random() * 74 : xPct,
      y: -20,
      speed: speedOverride != null ? speedOverride : BASE_SPEED * (0.85 + Math.random() * 0.5)
    };
    state.words.push(w);
    renderWord(w);
    return w;
  }

  function wordEl(id) {
    return fieldEl.querySelector('[data-id="' + id + '"]');
  }

  function renderWord(w) {
    var el = wordEl(w.id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'word';
      el.dataset.id = String(w.id);
      fieldEl.appendChild(el);
    }
    var done = '<span class="done">' + w.text.slice(0, w.typed) + '</span>';
    el.innerHTML = done + w.text.slice(w.typed);
    el.style.left = w.xPct + '%';
    el.style.top = w.y + 'px';
    el.classList.toggle('active', w.id === state.activeId);
  }

  function positionWords(dtMs) {
    var mult = levelSpeedMult();
    for (var i = state.words.length - 1; i >= 0; i--) {
      var w = state.words[i];
      w.y += w.speed * mult * dtMs;
      if (w.y >= FLOOR_Y) {
        missWord(w);
      } else {
        renderWord(w);
      }
    }
  }

  function removeWord(id, blasted) {
    var idx = -1;
    for (var i = 0; i < state.words.length; i++) {
      if (state.words[i].id === id) { idx = i; break; }
    }
    if (idx !== -1) state.words.splice(idx, 1);
    var el = wordEl(id);
    if (el) {
      if (blasted) {
        el.classList.add('blasted');
        setTimeout(function () { el.remove(); }, 230);
      } else {
        el.remove();
      }
    }
    if (state.activeId === id) state.activeId = null;
  }

  function missWord(w) {
    removeWord(w.id, false);
    state.lives--;
    state.streak = 0;
    updateHud();
    fieldEl.classList.remove('hit');
    void fieldEl.offsetWidth;
    fieldEl.classList.add('hit');
    Arcade.audio.beep(140, 0.2, 'sawtooth', 0.1);
    if (state.lives <= 0) gameOver();
  }

  function typeChar(ch) {
    if (state.mode !== 'playing') return false;
    ch = String(ch).toLowerCase();
    if (!/^[a-z]$/.test(ch)) return false;

    var target = null;
    for (var i = 0; i < state.words.length; i++) {
      var w = state.words[i];
      if (w.typed > 0) { target = w; break; }
    }
    if (!target) {
      for (var j = 0; j < state.words.length; j++) {
        if (state.words[j].text[0] === ch) { target = state.words[j]; break; }
      }
    }

    if (!target) {
      state.errorChars++;
      updateHud();
      return false;
    }

    if (target.text[target.typed] === ch) {
      target.typed++;
      state.correctChars++;
      if (target.typed >= target.text.length) destroyWord(target);
      else renderWord(target);
      updateHud();
      return true;
    }
    state.errorChars++;
    updateHud();
    return false;
  }

  function destroyWord(w) {
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    var base = w.text.length * 10;
    state.score += base * Math.min(5, state.streak) + state.level * 5;
    state.destroyed++;
    removeWord(w.id, true);
    Arcade.audio.beep(480 + Math.min(400, state.streak * 30), 0.07, 'triangle');

    if (state.destroyed % 10 === 0 && state.level < 12) {
      state.level++;
      Arcade.audio.beep(760, 0.18, 'triangle');
    }
    updateHud();
  }

  function startCountdown(cb) {
    state.mode = 'countdown';
    var n = 3;
    els.countNum.textContent = String(n);
    Arcade.showOverlay('overlay-count');
    countdownTimer = setInterval(function () {
      n--;
      if (n <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        Arcade.hideOverlays();
        cb();
      } else {
        els.countNum.textContent = String(n);
        Arcade.audio.beep(360, 0.08, 'sine');
      }
    }, COUNTDOWN_MS);
  }

  function start() {
    clearTimeout(countdownTimer);
    clearInterval(countdownTimer);
    clearField();
    state.words = [];
    state.nextId = 1;
    state.score = 0;
    state.lives = 3;
    state.level = 1;
    state.streak = 0;
    state.correctChars = 0;
    state.errorChars = 0;
    state.destroyed = 0;
    state.activeId = null;
    playedMs = 0;
    spawnTimer = 300;

    els.pause.disabled = false;
    startCountdown(function () {
      state.mode = 'playing';
      startedAt = performance.now();
      lastFrame = startedAt;
      spawn();
      startLoop();
      updateHud();
    });
  }

  function togglePause() {
    if (state.mode === 'playing') {
      state.mode = 'paused';
      playedMs += performance.now() - startedAt;
      stopLoop();
      Arcade.showOverlay('overlay-pause');
    } else if (state.mode === 'paused') {
      state.mode = 'playing';
      Arcade.hideOverlays();
      startedAt = performance.now();
      lastFrame = performance.now();
      startLoop();
    }
  }

  function halt() {
    clearTimeout(countdownTimer);
    clearInterval(countdownTimer);
    countdownTimer = null;
    if (state.mode === 'playing' || state.mode === 'countdown') togglePauseOrStop();
    else stopLoop();
  }

  function togglePauseOrStop() {
    if (state.mode === 'countdown') {
      stopLoop();
      state.mode = 'paused';
      Arcade.showOverlay('overlay-pause');
    } else {
      togglePause();
    }
  }

  function gameOver() {
    state.mode = 'game-over';
    stopLoop();
    els.finalScore.textContent = String(state.score);
    els.finalWpm.textContent = String(wpm());
    els.finalAcc.textContent = accuracyPct() + '%';
    els.finalLevel.textContent = 'Reached level ' + state.level +
      ' · best streak ×' + state.bestStreak;
    els.pause.disabled = true;
    Arcade.showOverlay('overlay-over');
    Arcade.audio.beep(120, 0.35, 'sawtooth', 0.13);
  }

  function clearField() {
    fieldEl.innerHTML = '';
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
    var dt = Math.min(50, now - lastFrame);
    lastFrame = now;
    playedMs += dt;
    positionWords(dt);
    spawnTimer -= dt;
    if (spawnTimer <= 0 && state.words.length < 6) {
      spawn();
      spawnTimer = levelSpawnMs();
    }
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.wpm.textContent = String(wpm());
    els.accuracy.textContent = accuracyPct() + '%';
    els.streak.textContent = '×' + Math.max(1, state.streak);
    els.lives.textContent = new Array(Math.max(0, state.lives) + 1).join('♥');
  }

  function onKey(e) {
    if (e.key.length !== 1) return;
    e.preventDefault();
    typeChar(e.key);
  }

  function init() {
    fieldEl = document.getElementById('field');
    els = {
      score: document.getElementById('score'),
      wpm: document.getElementById('wpm'),
      accuracy: document.getElementById('accuracy'),
      streak: document.getElementById('streak'),
      lives: document.getElementById('lives'),
      pause: document.getElementById('btn-pause'),
      countNum: document.getElementById('count-num'),
      finalScore: document.getElementById('final-score'),
      finalWpm: document.getElementById('final-wpm'),
      finalAcc: document.getElementById('final-acc'),
      finalLevel: document.getElementById('final-level')
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', halt);

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-start-overlay').addEventListener('click', start);
    document.getElementById('btn-retry').addEventListener('click', start);
    document.getElementById('btn-resume').addEventListener('click', togglePause);
    els.pause.addEventListener('click', togglePause);

    fieldEl.addEventListener('pointerdown', function () {
      var ghost = document.getElementById('ghost-input');
      if (ghost) ghost.focus();
    });

    updateHud();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get lives() { return state.lives; },
    get level() { return state.level; },
    get streak() { return state.streak; },
    get wpm() { return wpm(); },
    get accuracyPct() { return accuracyPct(); },
    get destroyedCount() { return state.destroyed; },
    wordList: function () {
      return state.words.map(function (w) {
        return { id: w.id, text: w.text, typed: w.typed };
      });
    },
    typeChar: typeChar,
    start: start,
    togglePause: togglePause,
    halt: halt,
    _debug: {
      spawn: spawn,
      setLives: function (n) { state.lives = n; updateHud(); },
      clearAllWords: function () {
        for (var i = state.words.length - 1; i >= 0; i--) removeWord(state.words[i].id, false);
        state.activeId = null;
      },
      forceDropAll: function () {
        state.words.forEach(function (w) { w.y = FLOOR_Y; });
      },
      skipToLevel: function (lv) {
        state.level = lv;
        updateHud();
      },
      elapsedMs: function () { return playedMs; }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
