<script setup>
import { computed } from 'vue';
import { settings, isExhaust } from '../composables/useSettings.js';
import { locale, t } from '../composables/useI18n.js';
import { EXHAUST } from '../lib/roulette.js';

const emit = defineEmits(['reset-cycle']);

const AVOID_VALUES = [0, 1, 2, 3, 5, EXHAUST]; // 表示名は i18n の avoid.*

const avoidRecent = computed({
  get: () => settings.avoidRecent,
  set: (v) => {
    if (v !== settings.avoidRecent) settings.cycle = []; // モードを変えたら一巡をやり直す
    settings.avoidRecent = v;
  },
});

function clearHistory() {
  settings.history = [];
  settings.cycle = [];
}

// どちらの言語でも 24 時間表記（15:19）
const timeLabel = (at) => new Date(at).toLocaleTimeString(locale.value === 'ja' ? 'ja-JP' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
</script>

<template>
  <section class="panel">
    <h2>{{ t('options.title') }}</h2>
    <label class="field">
      <span>{{ t('options.avoid') }}</span>
      <select id="avoid-recent" v-model.number="avoidRecent">
        <option v-for="v in AVOID_VALUES" :key="v" :value="v">{{ t(`avoid.${v}`) }}</option>
      </select>
    </label>
    <button v-if="isExhaust" id="reset-cycle" type="button" class="btn ghost reset-cycle" @click="emit('reset-cycle')">
      {{ t('options.resetCycle') }}
    </button>
    <label class="field">
      <span>{{ t('options.duration') }} <output id="duration-out">{{ t('options.seconds', { n: settings.duration }) }}</output></span>
      <input id="duration" v-model.number="settings.duration" type="range" min="1" max="10" step="0.5">
    </label>

    <h2 class="mt">{{ t('history.title') }}</h2>
    <ol id="history" class="history">
      <li v-if="!settings.history.length" class="empty">{{ t('history.empty') }}</li>
      <li v-for="h in settings.history" :key="`${h.at}-${h.id}`">
        <time :datetime="new Date(h.at).toISOString()">{{ timeLabel(h.at) }}</time>
        <span>{{ h.name }}</span>
        <span class="badge" :class="h.size">{{ t(`size.${h.size}`) }}</span>
      </li>
    </ol>
    <button id="clear-history" type="button" class="btn ghost" @click="clearHistory">{{ t('history.clear') }}</button>
  </section>
</template>
