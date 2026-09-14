import { describe, it, expect } from 'vitest';
import { LANGS, MESSAGES } from './messages.js';
import { MAPS } from '../data/maps.js';

const placeholders = (msg) => (typeof msg === 'string' ? [...msg.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort() : []);

describe('画面の文言', () => {
  it('LANGS と MESSAGES の言語が一致する', () => {
    expect(Object.keys(MESSAGES).sort()).toEqual(LANGS.map((l) => l.id).sort());
  });

  it('すべての言語が同じキーを持つ（訳し忘れがない）', () => {
    const ja = Object.keys(MESSAGES.ja).sort();
    for (const { id } of LANGS) expect(Object.keys(MESSAGES[id]).sort()).toEqual(ja);
  });

  it('差し込み用の {名前} が言語間で一致する', () => {
    for (const key of Object.keys(MESSAGES.ja)) {
      for (const { id } of LANGS) expect(placeholders(MESSAGES[id][key]), `${id}: ${key}`).toEqual(placeholders(MESSAGES.ja[key]));
    }
  });

  it('OBS の使い方の項目数が言語間で一致する', () => {
    for (const { id } of LANGS) expect(MESSAGES[id]['obs.howto']).toHaveLength(MESSAGES.ja['obs.howto'].length);
  });
});

describe('マップ一覧', () => {
  it('id が重複しない', () => {
    expect(new Set(MAPS.map((m) => m.id)).size).toBe(MAPS.length);
  });

  it('サイズは S / M / L のどれか', () => {
    for (const m of MAPS) expect(['S', 'M', 'L'], m.id).toContain(m.size);
  });

  it('カスタムマップ用の id（custom-）と被らない', () => {
    for (const m of MAPS) expect(m.id.startsWith('custom-')).toBe(false);
  });
});
