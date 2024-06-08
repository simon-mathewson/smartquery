import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './electron.vite.config';

export default mergeConfig(
  baseConfig.main,
  defineConfig({
    test: {
      globalSetup: 'src/main/test/globalSetup.ts',
    },
  }),
);
