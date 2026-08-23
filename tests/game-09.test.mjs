import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './helpers.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const DIR = 'games/game-09-type-storm';

describe('Game 09 — Type Storm', () => {
  let win, doc, Game;

  beforeEach(async () => {
    ({ window: win, document: doc } = await loadPage(DIR));
    Game = win.Game;
  });

  afterEach(() => {
    try { Game.halt(); } catch { /* noop */ }
  });

  async function startPlaying() {
    Game.start();
    await delay(1750);
    assert.equal(Game.state, 'playing');
  }

  function typeWord(word) {
    for (const ch of word) Game.typeChar(ch);
  }

  it('loads page in idle state with start overlay and clean HUD', () => {
    assert.ok(Game);
    assert.equal(Game.state, 'idle');
    assert.ok(!doc.getElementById('overlay-start').classList.contains('hidden'));
    assert.equal(doc.getElementById('lives').textContent, '♥♥♥');
    assert.equal(doc.getElementById('accuracy').textContent, '100%');
  });

  it('start runs a countdown then enters playing with a word on screen', async () => {
    Game.start();
    assert.equal(Game.state, 'countdown');
    assert.ok(!doc.getElementById('overlay-count').classList.contains('hidden'));

    await delay(1750);
    assert.equal(Game.state, 'playing');
    assert.ok(Game.wordList().length >= 1, 'initial word spawned');
    Game.halt();
  });

  it('typing a word fully destroys it and scores by length', () => {
    return startPlaying().then(() => {
      const w = Game._debug.spawn('code', 20, 0.001);
      typeWord('code');
      assert.equal(Game.score, 40 * Math.min(5, 1) + 5);
      assert.equal(Game.destroyedCount, 1);
      assert.equal(Game.streak, 1);
      assert.equal(Game.wordList().find((x) => x.id === w.id), undefined);
      Game.halt();
    });
  });

  it('partial progress persists; wrong chars cost accuracy only', () => {
    return startPlaying().then(() => {
      Game._debug.clearAllWords();
      Game._debug.spawn('storm', 30, 0.001);
      typeWord('sto');
      let entry = Game.wordList()[0];
      assert.equal(entry.typed, 3);

      const accBefore = Game.accuracyPct;
      assert.equal(Game.typeChar('z'), false, 'wrong char rejected');
      entry = Game.wordList()[0];
      assert.equal(entry.typed, 3, 'progress intact');
      assert.ok(Game.accuracyPct < 100, `accuracy dropped (${accBefore} → ${Game.accuracyPct})`);

      typeWord('rm');
      assert.equal(Game.destroyedCount, 1, 'word completed after mistake');
      Game.halt();
    });
  });

  it('first-letter targeting picks the matching word', () => {
    return startPlaying().then(() => {
      Game._debug.clearAllWords();
      const a = Game._debug.spawn('apple', 10, 0.0005);
      const b = Game._debug.spawn('banana', 60, 0.0005);
      typeWord('ban');
      const bEntry = Game.wordList().find((x) => x.id === b.id);
      const aEntry = Game.wordList().find((x) => x.id === a.id);
      assert.equal(bEntry.typed, 3, 'banana targeted');
      assert.equal(aEntry.typed, 0, 'apple untouched');
      void a;
      Game.halt();
    });
  });

  it('a word reaching the floor costs a life; three misses end the run', async () => {
    await startPlaying();
    Game._debug.setLives(1);
    Game._debug.spawn('dropme', 15, 9);
    await delay(700);
    assert.equal(Game.state, 'game-over');
    assert.ok(!doc.getElementById('overlay-over').classList.contains('hidden'));
    assert.match(doc.getElementById('final-level').textContent, /level/);
  });

  it('two misses cost two lives but the storm continues', async () => {
    await startPlaying();
    Game._debug.clearAllWords();

    Game._debug.spawn('aaa', 15, 9);
    await delay(450);
    assert.equal(Game.lives, 2);
    assert.equal(Game.state, 'playing');

    Game._debug.clearAllWords();
    Game._debug.spawn('bbb', 15, 9);
    await delay(450);
    assert.equal(Game.lives, 1);
    assert.equal(Game.state, 'playing');
    Game.halt();
  });

  it('WPM reflects typed characters over elapsed time', async () => {
    await startPlaying();
    Game._debug.clearAllWords();
    const words = ['cat', 'dog', 'sun'];
    for (const wd of words) {
      const w = Game._debug.spawn(wd, 25, 0.0008);
      await delay(1200);
      if (Game.state !== 'playing') break;
      typeWord(wd);
      void w;
    }
    assert.ok(Game.wpm > 0, `wpm computed (${Game.wpm})`);
    Game.halt();
  });

  it('level intensifies every 10 destroyed words', async () => {
    await startPlaying();
    Game._debug.clearAllWords();
    const seq = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj'];
    for (const wd of seq) {
      Game._debug.spawn(wd, 20, 0.0004);
      typeWord(wd);
    }
    assert.equal(Game.destroyedCount, 10);
    assert.equal(Game.level, 2, `level=${Game.level}`);
    Game.halt();
  });

  it('pause freezes the storm; resume continues', async () => {
    await startPlaying();
    doc.getElementById('btn-pause').click();
    assert.equal(Game.state, 'paused');
    doc.getElementById('btn-resume').click();
    assert.equal(Game.state, 'playing');
    Game.halt();
  });

  it('restart from game-over resets everything', async () => {
    await startPlaying();
    Game._debug.setLives(1);
    Game._debug.spawn('gone', 15, 9);
    await delay(600);
    assert.equal(Game.state, 'game-over');

    doc.getElementById('btn-retry').click();
    await delay(1750);
    assert.equal(Game.state, 'playing');
    assert.equal(Game.lives, 3);
    assert.equal(Game.score, 0);
    assert.equal(Game.level, 1);
    Game.halt();
  });
});
