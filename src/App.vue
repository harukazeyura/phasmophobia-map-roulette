<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import AppHeader from './components/AppHeader.vue';
import RouletteReel from './components/RouletteReel.vue';
import { settings, allMaps, enabledMaps, isExhaust, usedIds, toTheme } from './composables/useSettings.js';
import { locale, t } from './composables/useI18n.js';
import { useSync } from './composables/useSync.js';
import { pickTarget, buildSequence, uid, EXHAUST } from './lib/roulette.js';
import { params, isOverlay } from './lib/view.js';

// 操作画面だけで使う部品は 1 つのファイルにまとめて遅延読み込みし、OBS オーバーレイでは読み込まない。
// ヘッダーはルーレットより上にあり、後から出ると位置がずれるので通常どおり読み込む
const loadControls = () => import('./components/controls.js');
const AppFooter = defineAsyncComponent(() => loadControls().then((m) => m.AppFooter));
const MapSelector = defineAsyncComponent(() => loadControls().then((m) => m.MapSelector));
const OptionsPanel = defineAsyncComponent(() => loadControls().then((m) => m.OptionsPanel));
const ObsSettings = defineAsyncComponent(() => loadControls().then((m) => m.ObsSettings));

const reel = ref(null);
const spinning = ref(false);
const status = ref(''); // 文言そのものではなく i18n のキーを持つ（言語を切り替えても訳し直せるように）
const overlayTitle = params.has('title') ? params.get('title') : 'MAP';

// オーバーレイは URL の theme を優先（OBS 側と操作画面で保存先が別でも色を固定できる）
watchEffect(() => {
  const fromUrl = isOverlay ? toTheme(params.get('theme')) : null;
  document.documentElement.dataset.theme = fromUrl || settings.theme;
});
watchEffect(() => {
  document.documentElement.lang = locale.value;
});

const poolText = computed(() => {
  let text = t('stage.pool', { on: enabledMaps.value.length, total: allMaps.value.length });
  if (isExhaust.value) {
    const left = enabledMaps.value.filter((m) => !usedIds.value.has(m.id)).length;
    text += ` ・ ${t('stage.remaining', { n: left })}`;
  }
  return text;
});

const { emit } = useSync((evt) => runSpin(evt, false));

function spin() {
  if (spinning.value) return;
  const enabled = enabledMaps.value;
  if (!enabled.length) {
    status.value = 'status.noMaps';
    return;
  }
  const { target, reset } = pickTarget(enabled, settings);
  status.value = reset ? 'status.cycleReset' : '';
  const evt = {
    type: 'spin',
    id: uid(),
    seq: buildSequence(target, enabled, settings.duration),
    duration: settings.duration,
    resetCycle: reset,
  };
  emit(evt);
  runSpin(evt, true);
}

async function runSpin(evt, isOrigin) {
  spinning.value = true;
  const completed = await reel.value.spin(evt.seq, evt.duration);
  if (!completed) return; // 別の画面から新しく回された
  spinning.value = false;
  if (!isOrigin) return; // 履歴は回した側の画面だけが保存する

  const target = evt.seq[evt.seq.length - 2];
  settings.history = [{ ...target, at: Date.now() }, ...settings.history].slice(0, 50);
  if (settings.avoidRecent === EXHAUST) {
    if (evt.resetCycle) settings.cycle = [];
    if (!settings.cycle.includes(target.id)) settings.cycle.push(target.id);
  }
}

function resetCycle() {
  settings.cycle = [];
  status.value = '';
}

// 履歴がクリアされたらリールも「?」に戻す（別の画面でクリアされた場合も含む）
watch(() => settings.history.length, (n) => {
  if (!n && !spinning.value) reel.value.show(null);
});
watch(() => enabledMaps.value.length, (n) => {
  if (n && status.value === 'status.noMaps') status.value = '';
});

// スペース / Enter で回す（入力欄・ボタン・リンクにフォーカスがある時は除く）
function onKeydown(e) {
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(tag)) return;
  e.preventDefault();
  spin();
}

onMounted(() => {
  reel.value.show(settings.history[0] || null);
  if (!isOverlay) window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <AppHeader v-if="!isOverlay" />

  <section class="stage" :class="{ 'has-title': isOverlay && overlayTitle }" :aria-label="t('stage.label')">
    <div v-if="isOverlay && overlayTitle" class="overlay-title">{{ overlayTitle }}</div>
    <RouletteReel ref="reel" @spin="spin" />
    <div v-if="!isOverlay" class="stage-actions">
      <button id="spin-btn" class="spin-btn" type="button" :disabled="spinning" @click="spin">SPIN</button>
      <p id="pool-count" class="pool-count">{{ poolText }}</p>
      <p id="status" class="status" role="status" aria-live="polite" :hidden="!status">{{ status && t(status) }}</p>
    </div>
  </section>

  <div v-if="!isOverlay" class="panels">
    <MapSelector />
    <OptionsPanel @reset-cycle="resetCycle" />
    <ObsSettings />
  </div>

  <AppFooter v-if="!isOverlay" />
</template>
