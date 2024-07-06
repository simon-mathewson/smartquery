import { expect, test } from '@playwright/experimental-ct-react';
import { Card } from './Card';

test('Card', async ({ mount }) => {
  const $ = await mount(<Card role="menu">Card content</Card>);

  await expect($).toHaveRole('menu');
  await expect($).toContainText('Card content');
});
