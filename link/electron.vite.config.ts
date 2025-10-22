/// <reference types="vitest" />

import { externalizeDepsPlugin, type UserConfig } from 'electron-vite';
import { dirname, join } from 'node:path';

export default {
  main: {
    build: {
      rollupOptions: {
        // https://github.com/brianc/node-postgres/issues/2800#issuecomment-2014018129
        external: ['pg-native'],
        input: {
          main: join(__dirname, './src/main/index.mts'),
        },
      },
    },
    envPrefix: 'VITE_',
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': join(dirname(__dirname), 'shared'),
      },
    },
  },
} satisfies UserConfig;
