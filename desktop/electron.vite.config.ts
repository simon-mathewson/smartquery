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
        '~': './src',
        '@': join(dirname(__dirname), 'shared'),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: join(__dirname, './src/preload/index.ts'),
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
} satisfies UserConfig;
