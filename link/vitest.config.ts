import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './electron.vite.config';

export default mergeConfig(
  baseConfig.main,
  defineConfig({
    test: {
      globalSetup: 'src/main/test/globalSetup.ts',

      // Due to limited CI resources, we want to limit the number of threads to 1.
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
    },
  }),
);
