// 設定・履歴の状態。アプリ全体で 1 つだけ持ち、localStorage と自動で同期する
import { reactive, computed, watch } from 'vue';
import { MAPS } from '../data/maps.js';
import { LANGS } from '../i18n/messages.js';
import { SIZES, EXHAUST } from '../lib/roulette.js';

// index.html のチラつき防止スクリプトも同じキーを読む
const STORAGE_KEY = 'pmr:state:v1';

// 色の定義は style.css（:root がダーク、[data-theme="light"] がライト）
const THEMES = ['dark', 'light'];
export const toTheme = (id) => (THEMES.includes(id) ? id : null);
export const toLang = (id) => (LANGS.some((l) => l.id === id) ? id : null);

function normalize(s) {
  s = s && typeof s === 'object' ? s : {};
  const obs = s.obs && typeof s.obs === 'object' ? s.obs : {};
  return {
    enabled: s.enabled && typeof s.enabled === 'object' ? s.enabled : {},
    custom: Array.isArray(s.custom)
      ? s.custom.filter((m) => m && m.id && m.name && SIZES.includes(m.size))
      : [],
    avoidRecent: Number.isInteger(s.avoidRecent) ? s.avoidRecent : 0,
    duration: typeof s.duration === 'number' ? s.duration : 4,
    history: Array.isArray(s.history) ? s.history.slice(0, 50) : [],
    // 「全マップ一巡するまで」モードで今の一巡に出たマップ ID
    cycle: Array.isArray(s.cycle) ? s.cycle.filter((id) => typeof id === 'string') : [],
    theme: toTheme(s.theme) || 'dark',
    lang: toLang(s.lang), // null はブラウザの言語設定に従う
    obs: {
      bg: ['transparent', 'green', 'dark'].includes(obs.bg) ? obs.bg : 'transparent',
      rows: obs.rows === '1' ? '1' : '3',
      title: typeof obs.title === 'string' ? obs.title : 'MAP',
    },
  };
}

function load() {
  try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return normalize(null); }
}

export const settings = reactive(load());

// 変更したら保存（同じ値の書き込みでは storage イベントが飛ばないので、画面間でループしない）
watch(settings, () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* storage unavailable */ }
}, { deep: true });

// 別の画面（OBS のドック ⇔ ブラウザソースなど）で保存された変更を取り込む
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) Object.assign(settings, load());
});

export const allMaps = computed(() => [...MAPS, ...settings.custom]);
export const isEnabled = (m) => settings.enabled[m.id] !== false;
export const enabledMaps = computed(() => allMaps.value.filter(isEnabled));
export const isExhaust = computed(() => settings.avoidRecent === EXHAUST);
export const usedIds = computed(() => new Set(isExhaust.value ? settings.cycle : []));
