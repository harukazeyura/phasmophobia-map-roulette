<script setup>
import { ref, nextTick } from 'vue';
import { t } from '../composables/useI18n.js';

const emit = defineEmits(['spin']);

const items = ref([null, null, null]); // 並んでいるマップ。null は空行
const targetIndex = ref(1);            // 中央（当選）に止まる行
const spinning = ref(false);
const landed = ref(false);
const strip = ref(null);
let token = 0;

// アニメーションはスタイルを直接操作する（Vue の描画タイミングに左右されないように）
function setStrip(transition, transform) {
  if (!strip.value) return;
  strip.value.style.transition = transition;
  strip.value.style.transform = transform;
}

/** 回さずに表示する。map が null なら「?」 */
function show(map) {
  token++;
  spinning.value = false;
  landed.value = !!map;
  items.value = [null, map, null];
  targetIndex.value = 1;
  setStrip('none', 'translateY(0)');
}

/** seq を流して当選で止める。途中で別の spin/show が始まったら false で終わる */
async function spin(seq, duration) {
  const my = ++token;
  spinning.value = true;
  landed.value = false;
  items.value = seq;
  targetIndex.value = seq.length - 2;
  setStrip('none', 'translateY(0)');
  await nextTick();
  if (my !== token) return false;
  void strip.value.offsetHeight; // reflow してからアニメーション開始

  const offset = targetIndex.value - 1; // 当選を中央の行に置く
  setStrip(`transform ${duration}s cubic-bezier(.08,.72,.14,1)`, `translateY(calc(var(--item-h) * -${offset}))`);

  return new Promise((resolve) => {
    let finished = false;
    const el = strip.value;
    const done = () => {
      if (finished) return;
      finished = true;
      el.removeEventListener('transitionend', done);
      clearTimeout(timer);
      if (my !== token) return resolve(false);
      // 非表示タブ等でアニメーションが止まっていても、必ず当選位置で止める
      el.style.transition = 'none';
      spinning.value = false;
      landed.value = true;
      resolve(true);
    };
    el.addEventListener('transitionend', done);
    const timer = setTimeout(done, duration * 1000 + 400);
  });
}

defineExpose({ spin, show });
</script>

<template>
  <div id="reel" class="reel" :class="{ spinning, landed }" :title="t('reel.title')" @click="emit('spin')">
    <div ref="strip" class="reel-strip">
      <div
        v-for="(m, i) in items"
        :key="i"
        class="reel-item"
        :class="{ target: m && i === targetIndex, placeholder: !m && i === targetIndex }"
      >
        <template v-if="m">
          <span class="name">{{ m.name }}</span>
          <span class="badge" :class="m.size">{{ t(`size.${m.size}`) }}</span>
        </template>
        <template v-else-if="i === targetIndex">?</template>
      </div>
    </div>
  </div>
</template>
