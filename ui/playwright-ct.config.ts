import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

/** https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testMatch: '**/*.test.tsx',
  testDir: './',
  snapshotPathTemplate: '{testFilePath}/../__snapshots__/{arg}{ext}',
  timeout: 30 * 1000,
  fullyParallel: process.env.CI ? false : true,
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
    launchOptions: {
      // Ensure consistency between headed and headless mode by always showing scrollbars.
      ignoreDefaultArgs: ['--hide-scrollbars'],
      // args: process.env.CI
      //   ? [
      //       '--disable-dev-shm-usage',
      //       '--disable-gpu',
      //       '--no-sandbox',
      //       '--disable-setuid-sandbox',
      //       '--disable-background-timer-throttling',
      //       '--disable-backgrounding-occluded-windows',
      //       '--disable-renderer-backgrounding',
      //       '--disable-features=TranslateUI',
      //       '--disable-ipc-flooding-protection',
      //     ]
      //   : [],
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
      maxDiffPixelRatio: 0.07,
    },
  },
});
