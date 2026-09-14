<script setup>
import { ref, computed } from 'vue';
import { settings } from '../composables/useSettings.js';
import { locale, t } from '../composables/useI18n.js';

const overlayUrl = computed(() => {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('view', 'overlay');
  url.searchParams.set('theme', settings.theme);
  url.searchParams.set('lang', locale.value);
  url.searchParams.set('bg', settings.obs.bg);
  url.searchParams.set('rows', settings.obs.rows);
  url.searchParams.set('title', settings.obs.title);
  return url.toString();
});

const urlInput = ref(null);
const copied = ref(false);
let timer = null;

async function copy() {
  try {
    await navigator.clipboard.writeText(overlayUrl.value);
  } catch {
    urlInput.value.select();
    document.execCommand('copy');
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => { copied.value = false; }, 1500);
}
</script>

<template>
  <section class="panel panel-obs">
    <h2>{{ t('obs.title') }}</h2>
    <div class="field-row">
      <label class="field">
        <span>{{ t('obs.bg') }}</span>
        <select id="obs-bg" v-model="settings.obs.bg">
          <option v-for="bg in ['transparent', 'green', 'dark']" :key="bg" :value="bg">{{ t(`obs.bg.${bg}`) }}</option>
        </select>
      </label>
      <label class="field">
        <span>{{ t('obs.rows') }}</span>
        <select id="obs-rows" v-model="settings.obs.rows">
          <option v-for="rows in ['3', '1']" :key="rows" :value="rows">{{ t(`obs.rows.${rows}`) }}</option>
        </select>
      </label>
    </div>
    <label class="field">
      <span>{{ t('obs.heading') }}</span>
      <input id="obs-title" v-model="settings.obs.title" type="text" maxlength="40">
    </label>
    <label class="field">
      <span>{{ t('obs.url') }}</span>
      <div class="copy-row">
        <input id="obs-url" ref="urlInput" type="text" :value="overlayUrl" readonly>
        <button id="copy-url" type="button" class="btn" @click="copy">{{ copied ? t('obs.copied') : t('obs.copy') }}</button>
      </div>
    </label>
    <ol class="howto">
      <li v-for="(parts, i) in t('obs.howto')" :key="i">
        <template v-for="(part, j) in parts" :key="j">
          <b v-if="typeof part === 'object'">{{ part.b }}</b>
          <template v-else>{{ part }}</template>
        </template>
      </li>
    </ol>
  </section>
</template>
