import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vite.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/*.test.ts'],
      globalSetup: 'src/test/globalSetup.ts',
    },
  }),
);
