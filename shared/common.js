/* Browser Arcade — shared JS helpers (classic script, file:// safe). */
(function () {
  'use strict';

  var Arcade = {};

  /** localStorage that never throws (jsdom, privacy modes, disabled storage). */
  Arcade.storage = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
    }
  };

  Arcade.qs = function (sel, root) { return (root || document).querySelector(sel); };
  Arcade.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** Show one overlay inside a shell, hide siblings. */
  Arcade.showOverlay = function (id) {
    Arcade.qsa('.overlay').forEach(function (el) {
      el.classList.toggle('hidden', el.id !== id);
    });
  };
  Arcade.hideOverlays = function () {
    Arcade.qsa('.overlay').forEach(function (el) { el.classList.add('hidden'); });
  };

  /** Lazily-created WebAudio beep helper; safe no-op when unavailable. */
  Arcade.audio = (function () {
    var ctx = null;
    function ensure() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return ctx;
    }
    return {
      beep: function (freq, duration, type, volume) {
        try {
          var c = ensure();
          if (!c) return;
          var osc = c.createOscillator();
          var gain = c.createGain();
          osc.type = type || 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(volume == null ? 0.12 : volume, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (duration || 0.15));
          osc.connect(gain).connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + (duration || 0.15));
        } catch (e) { /* audio is best-effort */ }
      },
      reset: function () { ctx = null; }
    };
  })();

  /** Clamp + rand helpers. */
  Arcade.clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  Arcade.randInt = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };

  window.Arcade = Arcade;
})();
