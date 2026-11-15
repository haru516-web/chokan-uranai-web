import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { publicSite } from './scripts/site/plugin.mjs';
import { resolveSite } from './scripts/site/env.mjs';

const site = resolveSite();

export default defineConfig({
  base: './',
  optimizeDeps: { exclude: ['react-native'] },
  // npm run dev：/api は、手元の確認用サーバー（scripts/dev-api.mjs）へつなぐ。
  server: { proxy: { '/api': 'http://127.0.0.1:5181' } },
  // 公開用の静的ページ・サイトマップ。検索に出す設定になるのは、本番のビルドだけ（Vercelの本番、または SITE_URL と SITE_INDEX=1）。
  plugins: [react(), publicSite(site)],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' }
    ]
  }
});
