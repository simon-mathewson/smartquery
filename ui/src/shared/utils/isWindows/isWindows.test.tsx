import { expect, test } from '@playwright/experimental-ct-react';
import { IsWindowsStory } from './isWindows.story';

test.describe('isWindows', () => {
  test.describe('on Windows', () => {
    test.use({ userAgent: 'Windows NT 10.0; Win64; x64' });

    test('returns true', async ({ mount }) => {
      const $ = await mount(<IsWindowsStory />);

      await expect($).toHaveText('true');
    });
  });

  test.describe('on Linux', () => {
    test.use({ userAgent: 'Linux x86_64' });

    test('returns false', async ({ mount }) => {
      const $ = await mount(<IsWindowsStory />);

      await expect($).toHaveText('false');
    });
  });

  test.describe('on Mac', () => {
    test.use({ userAgent: 'Macintosh; Intel Mac OS X 10_15_7' });

    test('returns false', async ({ mount }) => {
      const $ = await mount(<IsWindowsStory />);

      await expect($).toHaveText('false');
    });
  });
});
