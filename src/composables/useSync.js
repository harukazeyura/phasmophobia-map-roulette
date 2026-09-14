// 操作画面 ⇔ OBS オーバーレイで「回した」イベントを共有する
// BroadcastChannel を基本に、使えない環境向けに localStorage の storage イベントでも送る
import { onMounted, onUnmounted } from 'vue';

const EVENT_KEY = 'pmr:event';
const CHANNEL = 'pmr';

export function useSync(onSpin) {
  const seen = new Set();
  let channel = null;
  try { channel = new BroadcastChannel(CHANNEL); } catch { /* unsupported */ }

  function receive(evt) {
    if (!evt || !evt.id || seen.has(evt.id)) return;
    seen.add(evt.id);
    if (evt.type === 'spin' && Array.isArray(evt.seq)) onSpin(evt);
  }
  function onStorage(e) {
    if (e.key !== EVENT_KEY || !e.newValue) return;
    try { receive(JSON.parse(e.newValue)); } catch { /* ignore */ }
  }

  onMounted(() => {
    if (channel) channel.onmessage = (e) => receive(e.data);
    window.addEventListener('storage', onStorage);
  });
  onUnmounted(() => {
    if (channel) channel.close();
    window.removeEventListener('storage', onStorage);
  });

  function emit(evt) {
    seen.add(evt.id);
    try { if (channel) channel.postMessage(evt); } catch { /* ignore */ }
    try { localStorage.setItem(EVENT_KEY, JSON.stringify(evt)); } catch { /* ignore */ }
  }

  return { emit };
}
