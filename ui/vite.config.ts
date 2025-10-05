import { analyzer } from 'vite-bundle-analyzer';
import circularDependencies from 'vite-plugin-circular-dependency';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { muteWarningsPlugin } from './muteWarningsPlugin';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    analyzer({ enabled: process.env.CI !== 'true' }),
    react(),
    svgr(),
    circularDependencies({ outputFilePath: 'circularDependencies.json' }),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,sqlite,svg,ttf,wasm}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 ** 2, // 5 MB
      },
      manifest: {
        name: 'SmartQuery',
        short_name: 'SmartQuery',
        theme_color: 'transparent',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            purpose: 'any',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            purpose: 'maskable',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    muteWarningsPlugin([
      ['SOURCEMAP_ERROR', "Can't resolve original location of error"],
      ['INVALID_ANNOTATION', 'contains an annotation that Rollup cannot interpret'],
    ]),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
});
