import { expect, test } from '@playwright/experimental-ct-react';
import { Logo } from './Logo';
import { TestApp } from '~/test/componentTests/TestApp';

test('Logo', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <Logo htmlProps={{ className: 'w-[50px]' }} />
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('logo.png');

  await expect($).toBeVisible();
  await expect($).toHaveCSS('width', '50px');
});
