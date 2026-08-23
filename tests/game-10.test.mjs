import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './helpers.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const DIR = 'games/game-10-simon';

describe('Game 10 — Simon Says', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try { Game.halt(); } catch { /* noop */ }
  });

  function pads() { return Array.from(doc.querySelectorAll('.simon-pad')); }

  /** Skips playback and returns the expected sequence. */
  async function playToInput() {
    Game.start();
    await delay(30);
    const seq = Game._debug.sequence();
    Game._debug.finishPlayback();
    assert.equal(Game.state, 'input');
    return seq;
  }

  async function completeRound(seq) {
    for (const pad of seq) {
      Game.pressPad(pad);
      if (Game.state === 'success') break;
    }
    await waitFor(() => Game.state === 'showing');
  }

  async function waitFor(cond, timeoutMs = 4000) {
    const start = Date.now();
    while (!cond()) {
      if (Date.now() - start > timeoutMs) throw new Error('waitFor timeout');
      await delay(25);
    }
  }

  it('loads page in idle state with four pads disabled', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.equal(pads().length, 4);
    assert.ok(pads().every((p) => p.disabled), 'pads locked while idle');
    assert.match(doc.getElementById('best').textContent, /^\d+$/);
  });

  it('start shows round 1 sequence then opens input phase', async () => {
    const seq = await playToInput();
    assert.equal(seq.length, 1, `round-1 sequence length (${seq.length})`);
    assert.ok(seq[0] >= 0 && seq[0] <= 3);
    assert.ok(pads().every((p) => !p.disabled));
  });

  it('correct input advances the round and grows the sequence', async () => {
    let seq = await playToInput();
    for (let round = 1; round <= 3; round++) {
      for (const pad of seq) {
        Game.pressPad(pad);
        if (Game.state === 'success') break;
      }
      assert.equal(Game.state, 'success', `completed round ${round}`);
      await waitFor(() => Game.state === 'showing');
      const next = Game._debug.sequence();
      assert.equal(next.length, round + 1, 'sequence grew by one');
      assert.deepEqual(next.slice(0, seq.length), seq, 'prefix preserved');
      seq = next;
      await waitFor(() => Game.state === 'input');
    }
    assert.equal(Game.round, 4, 'auto-advanced into round 4');
  });

  it('wrong pad in non-strict mode replays the same sequence', async () => {
    const seq = await playToInput();
    const wrong = (seq[0] + 1) % 4;
    Game.pressPad(wrong);
    assert.equal(Game.state, 'fail');

    await delay(1350);
    assert.equal(Game.state, 'showing', 'replays same sequence');
    assert.deepEqual(Game._debug.sequence(), seq, 'sequence unchanged in normal mode');
    Game._debug.finishPlayback();
    assert.equal(Game.state, 'input');
    assert.equal(Game.inputIndex, 0, 'input progress reset');
  });

  it('wrong pad in strict mode ends the game immediately', async () => {
    doc.getElementById('btn-strict').click();
    assert.equal(Game.strict, true);

    const seq = await playToInput();
    Game.pressPad((seq[0] + 1) % 4);
    assert.equal(Game.state, 'game-over');
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
    assert.equal(doc.getElementById('final-round').textContent, '1');
  });

  it('correct single pad completes a one-step round', async () => {
    const seq = await playToInput();
    Game.pressPad(seq[0]);
    assert.equal(Game.state, 'success');
    await waitFor(() => Game.state === 'showing');
    assert.equal(Game._debug.sequence().length, 2);
  });

  it('multi-step progress tracked within a round', async () => {
    let seq = await playToInput();
    // grow to a 2-step round
    for (const pad of seq) {
      Game.pressPad(pad);
      if (Game.state === 'success') break;
    }
    await waitFor(() => Game.state === 'showing');
    await waitFor(() => Game.state === 'input');
    seq = Game._debug.sequence();

    Game.pressPad(seq[0]);
    assert.equal(Game.inputIndex, 1);
    assert.equal(Game.state, 'input');
  });

  it('best round persists after a strict loss', async () => {
    doc.getElementById('btn-strict').click();
    let seq = await playToInput();
    await completeRound(seq);
    await waitFor(() => Game.state === 'input');
    seq = Game._debug.sequence();

    Game.pressPad((seq[0] + 2) % 4);
    assert.equal(Game.state, 'game-over', 'strict mistake ends run');
    assert.equal(doc.getElementById('final-round').textContent, '2',
      'crashed during round 2');
    assert.equal(Number(doc.getElementById('best').textContent), 2,
      'best recorded');
  });

  it('mute toggle silences beeps (state flag only)', () => {
    doc.getElementById('btn-mute').click();
    assert.equal(Game.muted, true);
    assert.equal(doc.getElementById('btn-mute').getAttribute('aria-pressed'), 'true');
    doc.getElementById('btn-mute').click();
    assert.equal(Game.muted, false);
  });

  it('keyboard G/R/Y/B press pads during input', async () => {
    const seq = await playToInput();
    const keys = ['g', 'r', 'y', 'b'];
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: keys[seq[0]], bubbles: true }));
    assert.ok(Game.state === 'success' || Game.inputIndex === 1,
      'keyboard press registered');
  });

  it('play again restarts at round 1 after game over', async () => {
    doc.getElementById('btn-strict').click();
    let seq = await playToInput();
    await completeRound(seq);
    await waitFor(() => Game.state === 'input');
    seq = Game._debug.sequence();
    Game.pressPad((seq[0] + 2) % 4);
    assert.equal(Game.state, 'game-over');

    doc.getElementById('btn-retry').click();
    await delay(30);
    assert.equal(Game.round, 1);
    assert.equal(Game.sequenceLength, 1);
    Game.halt();
  });
});
