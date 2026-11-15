import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { publicSite } from './scripts/site/plugin.mjs';

export default defineConfig({
  base: './',
  optimizeDeps: { exclude: ['react-native'] },
  // 公開用の静的ページ・サイトマップ。SITE_URL と SITE_INDEX=1 があるビルド（本番）だけ、検索に出す設定になる。
  plugins: [react(), publicSite({ siteUrl: process.env.SITE_URL, index: process.env.SITE_INDEX === '1' })],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' }
    ]
  }
});
