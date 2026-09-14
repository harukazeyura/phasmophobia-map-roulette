import { describe, it, expect } from 'vitest';
import { randInt, pickTarget, buildSequence, EXHAUST } from './roulette.js';

const MAPS = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, name: id.toUpperCase(), size: 'S' }));
const history = (...ids) => ids.map((id) => ({ id, name: id.toUpperCase(), size: 'S', at: 0 }));
const repeat = (n, fn) => Array.from({ length: n }, fn);

describe('randInt', () => {
  it('0 〜 n-1 の整数を偏りなく返す', () => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) counts[randInt(4)]++;
    for (const c of counts) expect(c).toBeGreaterThan(800); // 期待値 1000
  });
});

describe('pickTarget（直近の結果を除外）', () => {
  it('除外しない場合は全マップから選ぶ', () => {
    const picked = new Set(repeat(300, () => pickTarget(MAPS, { avoidRecent: 0, history: history('a'), cycle: [] }).target.id));
    expect([...picked].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('直近 N 回に出たマップは選ばない', () => {
    for (let i = 0; i < 300; i++) {
      const { target, reset } = pickTarget(MAPS, { avoidRecent: 2, history: history('a', 'b', 'c'), cycle: [] });
      expect(['c', 'd', 'e']).toContain(target.id);
      expect(reset).toBe(false);
    }
  });

  it('すべて除外される場合は全マップから選ぶ', () => {
    const { target } = pickTarget(MAPS, { avoidRecent: 5, history: history('a', 'b', 'c', 'd', 'e'), cycle: [] });
    expect(MAPS).toContain(target);
  });
});

describe('pickTarget（全マップ一巡するまで）', () => {
  const opts = (cycle, last) => ({ avoidRecent: EXHAUST, history: last ? history(last) : [], cycle });

  it('一巡の途中は、出たマップを選ばない', () => {
    for (let i = 0; i < 300; i++) {
      const { target, reset } = pickTarget(MAPS, opts(['a', 'b', 'c'], 'c'));
      expect(['d', 'e']).toContain(target.id);
      expect(reset).toBe(false);
    }
  });

  it('一巡したら最初からやり直し、直前のマップは続けて出さない', () => {
    for (let i = 0; i < 300; i++) {
      const { target, reset } = pickTarget(MAPS, opts(['a', 'b', 'c', 'd', 'e'], 'e'));
      expect(target.id).not.toBe('e');
      expect(reset).toBe(true);
    }
  });

  it('対象が 1 つだけなら、同じマップが続いても選ぶ', () => {
    const { target, reset } = pickTarget([MAPS[0]], opts(['a'], 'a'));
    expect(target.id).toBe('a');
    expect(reset).toBe(true);
  });

  it('何周しても、1 周の中で同じマップは出ない', () => {
    // App.vue と同じ手順で履歴と一巡の状態を更新しながら回す
    const state = { avoidRecent: EXHAUST, history: [], cycle: [] };
    const laps = [];
    for (let i = 0; i < MAPS.length * 20; i++) {
      const { target, reset } = pickTarget(MAPS, state);
      if (reset) state.cycle = [];
      if (state.cycle.length === 0) laps.push([]);
      state.cycle.push(target.id);
      state.history = [{ ...target, at: i }, ...state.history];
      laps[laps.length - 1].push(target.id);
    }
    expect(laps).toHaveLength(20);
    for (const lap of laps) expect(new Set(lap).size).toBe(MAPS.length);
    // 周の切れ目でも同じマップが連続しない
    for (let i = 1; i < laps.length; i++) expect(laps[i][0]).not.toBe(laps[i - 1].at(-1));
  });
});

describe('buildSequence', () => {
  it('当選は後ろから 2 番目に置かれ、隣り合う行に同じマップが並ばない', () => {
    for (let i = 0; i < 100; i++) {
      const target = MAPS[randInt(MAPS.length)];
      const seq = buildSequence(target, MAPS, 4);
      expect(seq.at(-2).id).toBe(target.id);
      for (let j = 1; j < seq.length; j++) expect(seq[j].id).not.toBe(seq[j - 1].id);
    }
  });

  it('対象が 2 つだけでも、隣り合う行に同じマップが並ばない', () => {
    const two = MAPS.slice(0, 2);
    for (let i = 0; i < 100; i++) {
      const seq = buildSequence(two[i % 2], two, 3);
      expect(seq.at(-2).id).toBe(two[i % 2].id);
      for (let j = 1; j < seq.length; j++) expect(seq[j].id).not.toBe(seq[j - 1].id);
    }
  });

  it('回転時間が長いほど行数が増える（最低 20 行 + 当選 + 末尾）', () => {
    expect(buildSequence(MAPS[0], MAPS, 1)).toHaveLength(22);
    expect(buildSequence(MAPS[0], MAPS, 10)).toHaveLength(102);
  });

  it('id / name / size だけのオブジェクトにする（画面間で送るため）', () => {
    const seq = buildSequence({ ...MAPS[0], extra: true }, MAPS, 1);
    for (const m of seq) expect(Object.keys(m).sort()).toEqual(['id', 'name', 'size']);
  });

  it('対象が 1 つだけでも止まらずに作れる', () => {
    const seq = buildSequence(MAPS[0], [MAPS[0]], 2);
    expect(seq.every((m) => m.id === 'a')).toBe(true);
  });
});
