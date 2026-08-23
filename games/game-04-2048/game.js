(function () {
  'use strict';

  var SIZE = 4;

  var boardEl = null;
  var tilesEl = null;
  var els = {};

  var state = {
    mode: 'idle',
    tiles: [],
    nextId: 1,
    score: 0,
    best: 0,
    won: false,
    undoSnapshot: null
  };

  function emptyCells(tiles) {
    var taken = {};
    tiles.forEach(function (t) { taken[t.r * SIZE + t.c] = true; });
    var out = [];
    for (var i = 0; i < SIZE * SIZE; i++) {
      if (!taken[i]) out.push({ r: Math.floor(i / SIZE), c: i % SIZE });
    }
    return out;
  }

  function spawnTile(tiles, count) {
    for (var n = 0; n < count; n++) {
      var free = emptyCells(tiles);
      if (!free.length) return;
      var cell = free[Math.floor(Math.random() * free.length)];
      tiles.push({
        id: state.nextId++,
        r: cell.r,
        c: cell.c,
        v: Math.random() < 0.9 ? 2 : 4,
        fresh: true
      });
    }
  }

  function toGrid(tiles) {
    var g = [];
    for (var i = 0; i < SIZE * SIZE; i++) g.push(null);
    tiles.forEach(function (t) { g[t.r * SIZE + t.c] = t; });
    return g;
  }

  function lineIndices(dir, k) {
    var idx = [];
    for (var j = 0; j < SIZE; j++) {
      if (dir === 'left') idx.push(k * SIZE + j);
      else if (dir === 'right') idx.push(k * SIZE + (SIZE - 1 - j));
      else if (dir === 'up') idx.push(j * SIZE + k);
      else idx.push((SIZE - 1 - j) * SIZE + k);
    }
    return idx;
  }

  function computeMove(dir) {
    var grid = toGrid(state.tiles);
    var moved = false;
    var gained = 0;
    var mergedIds = [];
    var deadIds = [];
    var moves = [];
    var merges = [];

    for (var line = 0; line < SIZE; line++) {
      var idxs = lineIndices(dir, line);
      var tilesInLine = [];
      idxs.forEach(function (gi) {
        if (grid[gi]) tilesInLine.push(grid[gi]);
      });

      var targetPos = 0;
      var lastMergedTile = null;
      for (var s = 0; s < tilesInLine.length; s++) {
        var tile = tilesInLine[s];
        if (lastMergedTile && lastMergedTile.v === tile.v) {
          var newPos = idxs[targetPos - 1];
          moves.push({ id: tile.id, r: Math.floor(newPos / SIZE), c: newPos % SIZE });
          merges.push({ survivorId: lastMergedTile.id, newValue: lastMergedTile.v * 2 });
          gained += lastMergedTile.v * 2;
          deadIds.push(tile.id);
          mergedIds.push(lastMergedTile.id);
          lastMergedTile = null;
          moved = true;
        } else {
          var pos = idxs[targetPos];
          var nr = Math.floor(pos / SIZE);
          var nc = pos % SIZE;
          if (tile.r !== nr || tile.c !== nc) moved = true;
          moves.push({ id: tile.id, r: nr, c: nc });
          lastMergedTile = tile;
          targetPos++;
        }
      }
    }
    return { moved: moved, gained: gained, moves: moves, merges: merges, deadIds: deadIds, mergedIds: mergedIds };
  }

  function applyMove(result) {
    result.moves.forEach(function (m) {
      var t = findTile(m.id);
      if (t) { t.r = m.r; t.c = m.c; }
    });
    state.tiles = state.tiles.filter(function (t) {
      return result.deadIds.indexOf(t.id) === -1;
    });
    result.merges.forEach(function (m) {
      var survivor = findTile(m.survivorId);
      if (survivor) survivor.v = m.newValue;
    });
    state.score += result.gained;
  }

  function findTile(id) {
    for (var i = 0; i < state.tiles.length; i++) {
      if (state.tiles[i].id === id) return state.tiles[i];
    }
    return null;
  }

  function snapshot() {
    return {
      tiles: state.tiles.map(function (t) { return { id: t.id, r: t.r, c: t.c, v: t.v }; }),
      score: state.score,
      won: state.won
    };
  }

  function restoreSnapshot(snap) {
    state.tiles = snap.tiles.map(function (t) {
      return { id: t.id, r: t.r, c: t.c, v: t.v };
    });
    state.score = snap.score;
    state.won = snap.won;
  }

  function hasMoves() {
    if (emptyCells(state.tiles).length) return true;
    var grid = toGrid(state.tiles);
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var t = grid[r * SIZE + c];
        if (!t) continue;
        if (c + 1 < SIZE) {
          var right = grid[r * SIZE + c + 1];
          if (right && right.v === t.v) return true;
        }
        if (r + 1 < SIZE) {
          var down = grid[(r + 1) * SIZE + c];
          if (down && down.v === t.v) return true;
        }
      }
    }
    return false;
  }

  function move(dir) {
    if (state.mode !== 'playing' && state.mode !== 'idle') return false;
    if (dir !== 'left' && dir !== 'right' && dir !== 'up' && dir !== 'down') return false;

    var result = computeMove(dir);
    if (!result.moved) return false;

    state.undoSnapshot = snapshot();
    applyMove(result);

    if (state.mode === 'idle') state.mode = 'playing';
    spawnTile(state.tiles, 1);
    saveBest();

    if (!state.won && hasValue(2048)) {
      state.won = true;
      state.mode = 'won';
      saveBest();
      render(true, result.mergedIds);
      updateHud();
      els.wonScore.textContent = String(state.score);
      Arcade.showOverlay('overlay-won');
      Arcade.audio.beep(880, 0.3, 'triangle');
      return true;
    }

    render(true, result.mergedIds);
    updateHud();

    if (!hasMoves()) {
      state.mode = 'over';
      saveBest();
      els.overScore.textContent = String(state.score);
      Arcade.showOverlay('overlay-over');
      Arcade.audio.beep(140, 0.35, 'sawtooth', 0.14);
    } else {
      Arcade.audio.beep(320, 0.05, 'sine', 0.06);
    }
    return true;
  }

  function hasValue(v) {
    for (var i = 0; i < state.tiles.length; i++) {
      if (state.tiles[i].v === v) return true;
    }
    return false;
  }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      Arcade.storage.set('2048.best', state.best);
    }
  }

  function reset() {
    state.tiles = [];
    state.nextId = 1;
    state.score = 0;
    state.won = false;
    state.undoSnapshot = null;
    spawnTile(state.tiles, 2);
    state.mode = 'playing';
    Arcade.hideOverlays();
    render(false, []);
    updateHud();
  }

  function backToStart() {
    state.mode = 'idle';
    state.tiles = [];
    state.nextId = 1;
    state.score = 0;
    state.won = false;
    state.undoSnapshot = null;
    Arcade.showOverlay('overlay-start');
    render(false, []);
    updateHud();
  }

  function undo() {
    if (!state.undoSnapshot) return false;
    restoreSnapshot(state.undoSnapshot);
    state.undoSnapshot = null;
    state.mode = 'playing';
    Arcade.hideOverlays();
    render(false, []);
    updateHud();
    return true;
  }

  function continuePlaying() {
    state.mode = 'playing';
    Arcade.hideOverlays();
  }

  function tileCoord(r, c) {
    var gap = parseFloat(getComputedStyle(tilesEl).getPropertyValue('--gap')) || 8;
    var w = tilesEl.clientWidth;
    var unit = (w - 3 * gap) / 4;
    return {
      x: c * (unit + gap),
      y: r * (unit + gap),
      font: Math.max(12, unit * 0.42)
    };
  }

  function classFor(v, extra) {
    var cls = 'tile ' + (v > 2048 ? 'vbig' : 'v' + v);
    return extra ? cls + ' ' + extra : cls;
  }

  function render(animate, mergedIds) {
    mergedIds = mergedIds || [];
    var live = {};
    for (var i = 0; i < state.tiles.length; i++) live[state.tiles[i].id] = true;

    Array.prototype.forEach.call(tilesEl.children, function (el) {
      if (!live[Number(el.dataset.id)]) el.remove();
    });

    state.tiles.forEach(function (t) {
      var el = tilesEl.querySelector('[data-id="' + t.id + '"]');
      if (!live[t.id]) return;
      if (!el) {
        el = document.createElement('div');
        el.dataset.id = String(t.id);
        tilesEl.appendChild(el);
      }
      var isNewValue = el.textContent !== String(t.v);
      el.className = classFor(t.v, isNewValue ? 'merged' : '');
      el.textContent = String(t.v);
      el.style.transform = translateFor(t.r, t.c);
      el.style.fontSize = tileCoord(t.r, t.c).font + 'px';
    });
  }

  function translateFor(r, c) {
    var pos = tileCoord(r, c);
    return 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
  }

  function updateHud() {
    els.score.textContent = String(state.score);
    els.best.textContent = String(state.best);
    els.undo.disabled = !state.undoSnapshot;
  }

  function onKey(e) {
    var map = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      a: 'left', d: 'right', w: 'up', s: 'down',
      A: 'left', D: 'right', W: 'up', S: 'down'
    };
    var dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  }

  function attachSwipe() {
    var shell = boardEl;
    var startX = 0;
    var startY = 0;
    var active = false;

    shell.addEventListener('pointerdown', function (e) {
      active = true;
      startX = e.clientX;
      startY = e.clientY;
    });
    shell.addEventListener('pointerup', function (e) {
      if (!active) return;
      active = false;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var ax = Math.abs(dx);
      var ay = Math.abs(dy);
      if (Math.max(ax, ay) < 24) return;
      if (ax > ay) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    });
  }

  function init() {
    boardEl = document.getElementById('board');
    tilesEl = document.getElementById('tiles');
    els = {
      score: document.getElementById('score'),
      best: document.getElementById('best'),
      undo: document.getElementById('btn-undo'),
      wonScore: document.getElementById('won-score'),
      overScore: document.getElementById('over-score')
    };

    state.best = Arcade.storage.get('2048.best', 0);

    document.addEventListener('keydown', onKey);

    document.getElementById('btn-new').addEventListener('click', reset);
    document.getElementById('btn-start').addEventListener('click', reset);
    document.getElementById('btn-retry').addEventListener('click', reset);
    document.getElementById('btn-fresh').addEventListener('click', reset);
    document.getElementById('btn-continue').addEventListener('click', continuePlaying);
    document.getElementById('btn-undo-over').addEventListener('click', undo);
    els.undo.addEventListener('click', undo);

    attachSwipe();

    state.tiles = [];
    spawnTile(state.tiles, 2);
    Arcade.showOverlay('overlay-start');
    render(false, []);
    updateHud();
  }

  window.Game = {
    get state() { return state.mode; },
    get score() { return state.score; },
    get best() { return state.best; },
    get won() { return state.won; },
    get canUndo() { return !!state.undoSnapshot; },
    values: function () {
      var g = [];
      for (var i = 0; i < SIZE * SIZE; i++) g.push(0);
      state.tiles.forEach(function (t) { g[t.r * SIZE + t.c] = t.v; });
      return g;
    },
    tileCount: function () { return state.tiles.length; },
    move: move,
    reset: reset,
    undo: undo,
    continuePlaying: continuePlaying,
    _debug: {
      evaluateOver: function () {
        if (!hasMoves()) {
          state.mode = 'over';
          saveBest();
          els.overScore.textContent = String(state.score);
          Arcade.showOverlay('overlay-over');
        }
        return state.mode;
      },
      setBoard: function (values) {
        state.tiles = [];
        for (var i = 0; i < values.length; i++) {
          if (values[i]) {
            state.tiles.push({
              id: state.nextId++,
              r: Math.floor(i / SIZE),
              c: i % SIZE,
              v: values[i]
            });
          }
        }
        render(false, []);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
