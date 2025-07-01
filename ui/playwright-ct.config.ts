import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

/** https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testMatch: '**/*.test.tsx',
  testDir: './',
  snapshotPathTemplate: '{testFilePath}/../__snapshots__/{arg}{ext}',
  timeout: 10 * 1000,
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['junit', { outputFile: 'test-ct-report.xml' }], ['list']] : 'html',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react(), svgr()],
      resolve: {
        alias: {
          '~': fileURLToPath(new URL('./src', import.meta.url)),
          '@': fileURLToPath(new URL('../shared', import.meta.url)),
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 400, height: 400 },
      },
    },
  ],
  expect: {
    toHaveScreenshot: {
      threshold: 0.3,
      maxDiffPixels: 10,
    },
  },
});
