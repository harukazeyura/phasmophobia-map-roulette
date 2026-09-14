// 抽選ロジック（画面に依存しない関数だけを置く）

export const SIZES = ['S', 'M', 'L']; // 表示名は i18n の size.* / sizeName.*
export const EXHAUST = -1; // avoidRecent の値: 全マップ一巡するまで除外

export function randInt(n) {
  if (globalThis.crypto && globalThis.crypto.getRandomValues) {
    // 棄却サンプリングで偏りなし
    const limit = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % n;
  }
  return Math.floor(Math.random() * n);
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const slim = (m) => ({ id: m.id, name: m.name, size: m.size });

/**
 * 対象マップから当選を 1 つ選ぶ。
 * reset は「全マップ一巡するまで」モードで一巡し、最初からやり直したかどうか。
 */
export function pickTarget(enabled, { avoidRecent, history, cycle }) {
  if (avoidRecent === EXHAUST) {
    const used = new Set(cycle);
    let pool = enabled.filter((m) => !used.has(m.id));
    const reset = !pool.length;
    if (reset) {
      // 一巡したらリセット。ただし直前と同じマップが続かないようにする
      const last = history[0] && history[0].id;
      pool = enabled.length > 1 ? enabled.filter((m) => m.id !== last) : enabled;
    }
    return { target: pool[randInt(pool.length)], reset };
  }
  const recent = new Set(history.slice(0, avoidRecent).map((h) => h.id));
  let pool = enabled.filter((m) => !recent.has(m.id));
  if (!pool.length) pool = enabled;
  return { target: pool[randInt(pool.length)], reset: false };
}

/** リールに流す並び: [先頭の埋め, ランダム..., 当選, 末尾の埋め] */
export function buildSequence(target, enabled, duration) {
  const count = Math.max(20, Math.round(duration * 10));
  // 隣の行と違うマップを選ぶ（対象が 1 つしかないときは同じでよい）
  const pickOther = (avoidId) => {
    const pool = enabled.length > 1 ? enabled.filter((m) => m.id !== avoidId) : enabled;
    return pool[randInt(pool.length)];
  };
  // 当選から逆向きに並べていくと、対象が 2 つだけでも隣り合う行が必ず別のマップになる
  const before = [];
  let next = target;
  for (let i = 0; i < count; i++) {
    next = pickOther(next.id);
    before.push(next);
  }
  return [...before.reverse(), target, pickOther(target.id)].map(slim);
}
