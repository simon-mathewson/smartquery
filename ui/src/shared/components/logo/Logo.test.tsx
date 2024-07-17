import { expect, test } from '@playwright/experimental-ct-react';
import { Logo } from './Logo';

test('Logo', async ({ mount }) => {
  const $ = await mount(<Logo />);

  await expect($).toHaveRole('img');
  await expect($).toBeVisible();
});
