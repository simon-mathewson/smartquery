/// <reference types="vitest" />

import { externalizeDepsPlugin, type UserConfig } from 'electron-vite';
import { dirname, join } from 'node:path';

export default {
  main: {
    build: {
      rollupOptions: {
        input: {
          main: join(__dirname, './src/main/index.mts'),
        },
      },
      commonjsOptions: {
        include: [/prisma\/client/],
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
