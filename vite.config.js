import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// 公開 URL（GitHub Actions の configure-pages から SITE_URL で渡す）。
// SNS 共有用の og:url / og:image は絶対 URL が必要なので、ビルド時に差し込む
function ogMeta() {
  const siteUrl = process.env.SITE_URL;
  const hasImage = existsSync(fileURLToPath(new URL('./public/og-image.png', import.meta.url)));
  return {
    name: 'og-meta',
    transformIndexHtml() {
      const meta = (attrs) => ({ tag: 'meta', attrs, injectTo: 'head' });
      const tags = [meta({ name: 'twitter:card', content: siteUrl && hasImage ? 'summary_large_image' : 'summary' })];
      if (!siteUrl) return tags;
      const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
      tags.push(meta({ property: 'og:url', content: base }));
      if (hasImage) {
        tags.push(
          meta({ property: 'og:image', content: `${base}og-image.png` }),
          meta({ property: 'og:image:width', content: '1200' }),
          meta({ property: 'og:image:height', content: '630' }),
        );
      }
      return tags;
    },
  };
}

export default defineConfig({
  // 相対パスで出力する。GitHub Pages のサブパス（/リポジトリ名/）でも設定変更なしで動く
  base: './',
  plugins: [
    vue(),
    ogMeta(),
    // 一度開けば、回線が切れても OBS のオーバーレイが表示されるようにする（Service Worker）
    VitePWA({
      registerType: 'autoUpdate', // 新しい版を公開したら次に開いたとき自動で切り替わる
      injectRegister: 'script-defer',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{html,js,css,woff2}'], // SNS 共有画像やライセンス文はキャッシュしない
        navigateFallbackDenylist: [/\.(txt|png)$/], // それらを直接開いたとき、アプリ画面に置き換えない
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.js'],
  },
});
