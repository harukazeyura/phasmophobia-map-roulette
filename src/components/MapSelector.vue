<script setup>
import { ref, computed } from 'vue';
import { settings, allMaps, isEnabled, usedIds } from '../composables/useSettings.js';
import { t } from '../composables/useI18n.js';
import { SIZES, uid } from '../lib/roulette.js';

// サイズ内は名前の昇順。numeric で「6 → 10 → 13 → 42」のように数字を数値として並べる
const byName = (a, b) => a.name.localeCompare(b.name, 'ja', { numeric: true, sensitivity: 'base' });
const mapsOfSize = (size) => allMaps.value.filter((m) => m.size === size).sort(byName);

const groups = computed(() => SIZES
  .map((size) => {
    const maps = mapsOfSize(size);
    return { size, maps, on: maps.filter(isEnabled).length };
  })
  .filter((g) => g.maps.length));

const isSizeAllOn = (size) => {
  const maps = mapsOfSize(size);
  return maps.length > 0 && maps.every(isEnabled);
};

function toggleSize(size) {
  const turnOn = !isSizeAllOn(size);
  for (const m of mapsOfSize(size)) settings.enabled[m.id] = turnOn;
}
function setAll(on) {
  for (const m of allMaps.value) settings.enabled[m.id] = on;
}

const customName = ref('');
const customSize = ref('S');

function addCustom() {
  const name = customName.value.trim();
  if (!name) return;
  settings.custom.push({ id: 'custom-' + uid(), name, size: customSize.value });
  customName.value = '';
}
function removeCustom(id) {
  settings.custom = settings.custom.filter((m) => m.id !== id);
  delete settings.enabled[id];
}
</script>

<template>
  <section class="panel panel-maps">
    <div class="panel-head">
      <h2>{{ t('maps.title') }}</h2>
      <div class="chip-row">
        <button
          v-for="size in SIZES"
          :key="size"
          type="button"
          class="chip"
          :class="{ on: isSizeAllOn(size) }"
          :data-size-toggle="size"
          :title="t(`sizeName.${size}`)"
          @click="toggleSize(size)"
        >{{ t(`size.${size}`) }}</button>
        <button id="select-all" type="button" class="chip ghost" @click="setAll(true)">{{ t('maps.all') }}</button>
        <button id="select-none" type="button" class="chip ghost" @click="setAll(false)">{{ t('maps.none') }}</button>
      </div>
    </div>

    <div id="map-groups" class="map-groups">
      <div v-for="g in groups" :key="g.size" class="map-group">
        <h3>
          <span class="badge" :class="g.size">{{ t(`size.${g.size}`) }}</span>
          {{ t('maps.group', { size: t(`sizeName.${g.size}`), on: g.on, total: g.maps.length }) }}
        </h3>
        <ul class="map-list">
          <li v-for="m in g.maps" :key="m.id">
            <label :class="{ used: usedIds.has(m.id) }">
              <input
                type="checkbox"
                :data-map-id="m.id"
                :checked="isEnabled(m)"
                @change="settings.enabled[m.id] = $event.target.checked"
              >
              <span :title="m.name">{{ m.name }}</span>
              <span v-if="usedIds.has(m.id)" class="used-tag">{{ t('maps.played') }}</span>
            </label>
            <button
              v-if="m.id.startsWith('custom-')"
              type="button"
              class="del-btn"
              :aria-label="t('maps.remove', { name: m.name })"
              @click="removeCustom(m.id)"
            >×</button>
          </li>
        </ul>
      </div>
    </div>

    <form id="custom-form" class="custom-form" @submit.prevent="addCustom">
      <input id="custom-name" v-model="customName" type="text" :placeholder="t('maps.customPlaceholder')" maxlength="60" required>
      <select id="custom-size" v-model="customSize" :aria-label="t('maps.sizeLabel')">
        <option v-for="size in SIZES" :key="size" :value="size">{{ t(`sizeName.${size}`) }}</option>
      </select>
      <button type="submit" class="btn">{{ t('maps.add') }}</button>
    </form>
  </section>
</template>
