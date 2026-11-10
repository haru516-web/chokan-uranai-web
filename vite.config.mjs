import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  optimizeDeps: { exclude: ['react-native'] },
  plugins: [react()],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' }
    ]
  }
});
