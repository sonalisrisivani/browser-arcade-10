(function () {
  'use strict';

  var ICONS = ['🍒', '🍋', '🍇', '🍉', '⭐', '🍀', '🔥', '⚡', '🌈', '🎈',
    '🎲', '🚀', '🐙', '🦊', '🦋', '🌵', '🍕', '🎧'];

  var boardEl = null;
  var els = {};
  var flipBackTimer = null;
  var timerId = null;

  var state = {
    mode: 'idle',
    size: 4,
    deck: [],
    flipped: [],
    matched: 0,
    moves: 0,
    seconds: 0,
    best: null
  };

  function pairs() { return (state.size * state.size) / 2; }

  function storageKey() { return 'memory.best.' + state.size; }

  function shuffledDeck() {
    var chosen = ICONS.slice(0, pairs());
    var deck = [];
    for (var i = 0; i < chosen.length; i++) {
      deck.push({ icon: chosen[i], pair: i });
      deck.push({ icon: chosen[i], pair: i });
    }
    for (var j = deck.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j];
      deck[j] = deck[k];
      deck[k] = tmp;
    }
    return deck;
  }

  function reset() {
    clearTimeout(flipBackTimer);
    stopTimer();
    state.deck = shuffledDeck();
    state.flipped = [];
    state.matched = 0;
    state.moves = 0;
    state.seconds = 0;
    state.mode = 'idle';
    state.best = Arcade.storage.get(storageKey(), null);
    Arcade.hideOverlays();
    render();
    updateHud();
  }

  function start() {
    if (state.mode !== 'playing') {
      state.mode = 'playing';
      startTimer();
    }
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
      state.seconds++;
      els.time.textContent = state.seconds + 's';
    }, 1000);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function flip(index) {
    if (state.mode === 'won') return false;
    if (index < 0 || index >= state.deck.length) return false;
    var cell = boardEl.children[index];
    if (!cell || cell.classList.contains('matched') || cell.classList.contains('flipped')) return false;

    start();
    cell.classList.add('flipped');
    state.flipped.push(index);
    Arcade.audio.beep(440, 0.06, 'sine');

    if (state.flipped.length === 2) {
      state.moves++;
      updateHud();
      var a = state.deck[state.flipped[0]];
      var b = state.deck[state.flipped[1]];
      if (a.pair === b.pair) {
        boardEl.children[state.flipped[0]].classList.add('matched');
        boardEl.children[state.flipped[1]].classList.add('matched');
        boardEl.children[state.flipped[0]].classList.remove('flipped');
        boardEl.children[state.flipped[1]].classList.remove('flipped');
        state.matched++;
        state.flipped = [];
        Arcade.audio.beep(660, 0.12, 'triangle');
        updateHud();
        if (state.matched === pairs()) win();
      } else {
        lockBoard(true);
        flipBackTimer = setTimeout(function () {
          boardEl.children[state.flipped[0]].classList.remove('flipped');
          boardEl.children[state.flipped[1]].classList.remove('flipped');
          state.flipped = [];
          lockBoard(false);
        }, 750);
      }
    }
    return true;
  }

  function lockBoard(lock) {
    Array.prototype.forEach.call(boardEl.children, function (cell) {
      if (!cell.classList.contains('matched')) {
        cell.style.pointerEvents = lock ? 'none' : '';
      }
    });
  }

  function starsFor(moves) {
    var p = pairs();
    if (moves <= Math.ceil(p * 1.3)) return 3;
    if (moves <= Math.ceil(p * 1.9)) return 2;
    return 1;
  }

  function win() {
    state.mode = 'won';
    stopTimer();
    var stars = starsFor(state.moves);
    els.winStars.textContent = new Array(stars + 1).join('⭐');
    els.winMoves.textContent = String(state.moves);
    els.winTime.textContent = String(state.seconds);

    var isBest = state.best === null || state.seconds < state.best;
    if (isBest) {
      state.best = state.seconds;
      Arcade.storage.set(storageKey(), state.best);
    }
    els.winBestNote.classList.toggle('hidden', !isBest);
    updateHud();
    Arcade.showOverlay('overlay-win');
    Arcade.audio.beep(880, 0.25, 'triangle');
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = 'repeat(' + state.size + ', 1fr)';
    for (var i = 0; i < state.deck.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'card-cell';
      btn.setAttribute('aria-label', 'Card ' + (i + 1));
      btn.dataset.index = String(i);
      btn.innerHTML =
        '<span class="card-inner">' +
          '<span class="card-face card-back"></span>' +
          '<span class="card-face card-front">' + state.deck[i].icon + '</span>' +
        '</span>';
      boardEl.appendChild(btn);
    }
  }

  function render() { buildBoard(); }

  function updateHud() {
    els.moves.textContent = String(state.moves);
    els.time.textContent = state.seconds + 's';
    els.pairs.textContent = state.matched + '/' + pairs();
    els.best.textContent = state.best === null ? '—' : state.best + 's';
  }

  function setSize(size) {
    state.size = size;
    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.classList.toggle('active', Number(b.dataset.size) === size);
    });
    reset();
  }

  function init() {
    boardEl = document.getElementById('board');
    els = {
      moves: document.getElementById('moves'),
      time: document.getElementById('time'),
      pairs: document.getElementById('pairs'),
      best: document.getElementById('best'),
      winStars: document.getElementById('win-stars'),
      winMoves: document.getElementById('win-moves'),
      winTime: document.getElementById('win-time'),
      winBestNote: document.getElementById('win-best-note')
    };

    boardEl.addEventListener('click', function (e) {
      var cell = e.target.closest('.card-cell');
      if (cell) flip(Number(cell.dataset.index));
    });

    document.getElementById('btn-restart').addEventListener('click', reset);
    document.getElementById('btn-again').addEventListener('click', reset);

    Array.prototype.forEach.call(document.querySelectorAll('.seg-btn'), function (b) {
      b.addEventListener('click', function () { setSize(Number(b.dataset.size)); });
    });

    reset();
  }

  window.Game = {
    get state() { return state.mode; },
    get moves() { return state.moves; },
    get matched() { return state.matched; },
    get seconds() { return state.seconds; },
    get size() { return state.size; },
    get deck() { return state.deck; },
    get stars() { return starsFor(state.moves); },
    flip: flip,
    reset: reset,
    setSize: setSize,
    starsFor: starsFor
  };

  document.addEventListener('DOMContentLoaded', init);
})();
