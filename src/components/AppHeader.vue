<script setup>
import { computed } from 'vue';
import { settings } from '../composables/useSettings.js';
import { locale, t } from '../composables/useI18n.js';
import { LANGS } from '../i18n/messages.js';

// アイコンは今のモード（ダークなら月、ライトなら太陽）。ラベルは押したときの動作
const isDark = computed(() => settings.theme === 'dark');
const themeLabel = computed(() => t(isDark.value ? 'theme.toLight' : 'theme.toDark'));
function toggleTheme() {
  settings.theme = isDark.value ? 'light' : 'dark';
}
</script>

<template>
  <header class="app-header">
    <div>
      <h1>Phasmophobia <span>Map Roulette</span></h1>
      <p class="lead">{{ t('app.lead') }}</p>
    </div>
    <div class="header-controls">
      <div id="lang-buttons" class="toggle-group" role="group" :aria-label="t('header.language')">
        <button
          v-for="lang in LANGS"
          :key="lang.id"
          type="button"
          class="toggle-btn"
          :data-lang-id="lang.id"
          :lang="lang.id"
          :aria-pressed="String(locale === lang.id)"
          @click="settings.lang = lang.id"
        >{{ lang.name }}</button>
      </div>
      <button
        id="theme-toggle"
        type="button"
        class="icon-btn"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="toggleTheme"
      >
        <!-- アイコンは Lucide（ISC ライセンス）の moon / sun -->
        <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
    </div>
  </header>
</template>
