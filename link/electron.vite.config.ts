/// <reference types="vitest" />

import { externalizeDepsPlugin, type UserConfig } from 'electron-vite';

export default {
  main: {
    build: {
      commonjsOptions: {
        include: [/prisma\/client/],
      },
    },
    envPrefix: 'VITE_',
    plugins: [externalizeDepsPlugin()],
  },
} satisfies UserConfig;
