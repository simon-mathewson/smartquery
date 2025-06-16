import { expect, test } from '@playwright/experimental-ct-react';
import { Logo } from './Logo';

test('Logo', async ({ mount }) => {
  const $ = await mount(<Logo htmlProps={{ className: 'w-[50px]' }} />);

  await expect($).toHaveRole('presentation');
  await expect($).toBeVisible();
  await expect($).toHaveCSS('width', '50px');
});
