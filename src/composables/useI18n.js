// 表示言語。保存された選択 → ブラウザの言語設定の順で決める（オーバーレイは URL の lang を最優先）
import { computed } from 'vue';
import { settings, toLang } from './useSettings.js';
import { MESSAGES } from '../i18n/messages.js';
import { params, isOverlay } from '../lib/view.js';

// ブラウザの第一言語が日本語なら日本語、それ以外は英語
function detect() {
  const first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return first.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export const locale = computed(() => (isOverlay && toLang(params.get('lang'))) || settings.lang || detect());

/** 文言を取り出す。{name} を vars の値で置き換える（配列などはそのまま返す） */
export function t(key, vars = {}) {
  const msg = MESSAGES[locale.value][key] ?? MESSAGES.ja[key] ?? key;
  if (typeof msg !== 'string') return msg;
  return msg.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}
