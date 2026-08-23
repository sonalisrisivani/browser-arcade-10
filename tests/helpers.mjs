/**
 * Test harness: loads a game page into jsdom with a stubbed Canvas2D context,
 * executes its scripts, and exposes helpers to drive the game.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Recording Canvas2D stub — enough surface for our games. */
function makeCtx() {
  const base = {
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '',
    globalAlpha: 1, shadowBlur: 0, shadowColor: '',
  };
  const noop = () => {};
  const ctx = {
    ...base,
    clearRect: noop, fillRect: noop, strokeRect: noop,
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    arc: noop, fill: noop, stroke: noop, rect: noop,
    fillText: noop, strokeText: noop,
    measureText: () => ({ width: 10 }),
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    drawImage: noop, roundRect: noop, ellipse: noop,
    quadraticCurveTo: noop, bezierCurveTo: noop,
    setLineDash: noop, clip: noop, transform: noop, setTransform: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return noop;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

function stubCanvas(window) {
  const proto = window.HTMLCanvasElement.prototype;
  proto.getContext = function (type) {
    if (!this.__ctx) {
      this.__ctx = makeCtx();
      this.width = this.width || 300;
      this.height = this.height || 150;
    }
    return type && String(type).includes('2d') ? this.__ctx : null;
  };
}

const scriptCache = new Map();
function readScript(absFile) {
  if (!scriptCache.has(absFile)) scriptCache.set(absFile, fs.readFileSync(absFile, 'utf8'));
  return scriptCache.get(absFile);
}

/**
 * Load a game page by folder name, e.g. loadPage('games/game-01-snake').
 * Executes <script src> files in order, then fires DOMContentLoaded.
 */
export function loadPage(relDir) {
  const dir = path.join(ROOT, relDir);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `file://${dir}/index.html`,
    runScripts: 'outside-only',
  });
  const { window } = dom;
  stubCanvas(window);

  // Opaque origins (file://) get no localStorage from jsdom — polyfill one so
  // Arcade.storage behaves like a normal browser.
  if (!window.localStorage) {
    const store = new Map();
    const ls = {
      getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
      setItem: (k, v) => store.set(String(k), String(v)),
      removeItem: (k) => store.delete(String(k)),
      clear: () => store.clear(),
      key: (i) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    };
    Object.defineProperty(window, 'localStorage', { value: ls, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { value: ls, configurable: true });
  }

  // rAF shim backed by timers so awaited frames actually settle.
  window.requestAnimationFrame = (cb) =>
    setTimeout(() => cb(performance.now()), 16);
  window.cancelAnimationFrame = (id) => clearTimeout(id);

  for (const script of Array.from(window.document.querySelectorAll('script[src]'))) {
    const src = script.getAttribute('src');
    const file = path.resolve(dir, src.replace(/^\//, '').split('?')[0]);
    try {
      window.eval(readScript(file));
    } catch (err) {
      throw new Error(`Script error in ${src}: ${err.message}\n${err.stack}`);
    }
  }

  window.document.dispatchEvent(
    new window.Event('DOMContentLoaded', { bubbles: true })
  );

  return { dom, window, document: window.document };
}

/** Dispatch keydown+keyup on document. Returns preventDefault result. */
export function pressKey(window, key, opts = {}) {
  const init = { key, bubbles: true, cancelable: true, ...opts };
  const down = new window.KeyboardEvent('keydown', init);
  (opts.target || window.document).dispatchEvent(down);
  window.document.dispatchEvent(new window.KeyboardEvent('keyup', init));
  return down.defaultPrevented;
}

/** Dispatch a mouse click with client coords. */
export function clickAt(window, el, x = 0, y = 0) {
  el.dispatchEvent(new window.MouseEvent('click', {
    bubbles: true, cancelable: true, clientX: x, clientY: y,
  }));
}

/** Dispatch pointer/mouse move at coords on a target. */
export function moveAt(window, el, x, y, type = 'mousemove') {
  el.dispatchEvent(new window.MouseEvent(type, {
    bubbles: true, cancelable: true, clientX: x, clientY: y,
  }));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Advance fake time by awaiting real timers (games use setTimeout/rAF shims). */
export async function tick(window, ms = 20) {
  await sleep(ms);
}

export { ROOT };
