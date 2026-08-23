(function () {
  'use strict';

  var TONES = [329.63, 261.63, 220, 164.81];
  var PAD_NAMES = ['green', 'red', 'yellow', 'blue'];

  var els = {};
  var playbackTimer = null;
  var inputTimeout = null;

  var state = {
    mode: 'idle',
    sequence: [],
    inputIndex: 0,
    round: 0,
    best: 0,
    strict: false,
    muted: false
  };

  function beep(pad, duration) {
    if (state.muted) return;
    Arcade.audio.beep(TONES[pad], duration == null ? 0.28 : duration, 'sine', 0.16);
  }

  function extendSequence() {
    state.sequence.push(Math.floor(Math.random() * 4));
  }

  function startRound() {
    state.round++;
    extendSequence();
    state.inputIndex = 0;
    updateHud();
    playSequence();
  }

  function playSequence() {
    state.mode = 'showing';
    els.centerLabel.textContent = String(state.round);
    setPadsEnabled(false);
    setStatus('Watch…');

    clearTimeout(playbackTimer);
    var i = 0;
    var stepMs = Math.max(260, 560 - state.round * 18);

    function step() {
      if (i >= state.sequence.length) {
        playbackTimer = setTimeout(function () {
          state.mode = 'input';
          setPadsEnabled(true);
          setStatus('Your turn!');
          armInputTimeout();
        }, stepMs * 0.6);
        return;
      }
      var pad = state.sequence[i];
      lightPad(pad, stepMs * 0.62);
      beep(pad, stepMs / 1000 * 0.8);
      i++;
      playbackTimer = setTimeout(step, stepMs);
    }
    step();
  }

  function lightPad(pad, ms) {
    var el = els.pads.children[pad];
    el.classList.add('lit');
    setTimeout(function () { el.classList.remove('lit'); }, ms || 300);
  }

  function pressPad(pad) {
    if (state.mode !== 'input') return false;
    lightPad(pad, 240);
    beep(pad, 0.22);

    if (pad !== state.sequence[state.inputIndex]) {
      wrongPad();
      return true;
    }

    state.inputIndex++;
    clearTimeout(inputTimeout);
    if (state.inputIndex >= state.sequence.length) {
      state.mode = 'success';
      setStatus('Nice!');
      els.centerLabel.textContent = '✓';
      Arcade.audio.beep(660, 0.2, 'triangle');
      playbackTimer = setTimeout(function () {
        if (state.mode === 'success') startRound();
      }, 900);
    } else {
      armInputTimeout();
    }
    return true;
  }

  function armInputTimeout() {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(function () {
      if (state.mode === 'input') wrongPad();
    }, 5200 + state.sequence.length * 400);
  }

  function wrongPad() {
    state.mode = 'fail';
    setPadsEnabled(false);
    clearTimeout(inputTimeout);
    setStatus('Wrong!');
    Arcade.audio.beep(110, 0.45, 'sawtooth', 0.15);

    saveBest();

    if (state.strict) {
      endGame();
    } else {
      els.centerLabel.textContent = '↻';
      playbackTimer = setTimeout(function () {
        state.inputIndex = 0;
        playSequence();
      }, 1200);
    }
  }

  function saveBest() {
    if (state.round > state.best) {
      state.best = state.round;
      Arcade.storage.set('simon.best', state.best);
    }
  }

  function endGame() {
    state.mode = 'game-over';
    saveBest();
    els.finalRound.textContent = String(state.round);
    updateHud();
    Arcade.showOverlay('overlay-over');
  }

  function start() {
    clearTimeout(playbackTimer);
    clearTimeout(inputTimeout);
    Arcade.hideOverlays();
    state.sequence = [];
    state.round = 0;
    state.best = Arcade.storage.get('simon.best', 0);
    state.inputIndex = 0;
    updateHud();
    startRound();
  }

  function halt() {
    clearTimeout(playbackTimer);
    clearTimeout(inputTimeout);
  }

  function toggleStrict(force) {
    state.strict = force != null ? force : !state.strict;
    els.strictBtn.textContent = 'Strict: ' + (state.strict ? 'On' : 'Off');
    els.strictBtn.setAttribute('aria-pressed', String(state.strict));
    els.strictBtn.classList.toggle('active', state.strict);
  }

  function toggleMute(force) {
    state.muted = force != null ? force : !state.muted;
    els.muteBtn.textContent = state.muted ? '🔇 Muted' : '🔊 Sound';
    els.muteBtn.setAttribute('aria-pressed', String(state.muted));
  }

  function setPadsEnabled(on) {
    Array.prototype.forEach.call(els.pads.children, function (el) {
      if (el.classList.contains('simon-pad')) el.disabled = !on;
    });
  }

  function setStatus(text) {
    els.centerLabel.textContent = text.length > 3 ? '•' : els.centerLabel.textContent;
    els.centerLabel.setAttribute('data-status', text);
  }

  function updateHud() {
    els.round.textContent = String(state.round);
    els.best.textContent = String(state.best);
  }

  function init() {
    els = {
      pads: document.getElementById('pads'),
      round: document.getElementById('round'),
      best: document.getElementById('best'),
      strictBtn: document.getElementById('btn-strict'),
      muteBtn: document.getElementById('btn-mute'),
      centerLabel: document.getElementById('center-label'),
      finalRound: document.getElementById('final-round')
    };

    state.best = Arcade.storage.get('simon.best', 0);

    els.pads.addEventListener('click', function (e) {
      var pad = e.target.closest('.simon-pad');
      if (!pad) return;
      pressPad(Number(pad.dataset.pad));
    });

    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-retry').addEventListener('click', start);
    els.strictBtn.addEventListener('click', function () { toggleStrict(); });
    els.muteBtn.addEventListener('click', function () { toggleMute(); });

    window.addEventListener('keydown', function (e) {
      var map = { g: 0, r: 1, y: 2, b: 3 };
      var key = e.key.toLowerCase();
      if (key in map && !e.repeat) pressPad(map[key]);
    });

    setPadsEnabled(false);
    updateHud();
  }

  window.Game = {
    get state() { return state.mode; },
    get round() { return state.round; },
    get best() { return state.best; },
    get sequenceLength() { return state.sequence.length; },
    get strict() { return state.strict; },
    get muted() { return state.muted; },
    get inputIndex() { return state.inputIndex; },
    start: start,
    pressPad: pressPad,
    toggleStrict: toggleStrict,
    toggleMute: toggleMute,
    halt: halt,
    _debug: {
      finishPlayback: function () {
        clearTimeout(playbackTimer);
        state.mode = 'input';
        setPadsEnabled(true);
      },
      sequence: function () { return state.sequence.slice(); }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
