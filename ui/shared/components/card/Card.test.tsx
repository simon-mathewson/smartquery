import { expect, test } from '@playwright/experimental-ct-react';
import { Card } from './Card';
import { TestApp } from '~/test/componentTests/TestApp';

test('Card', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <Card htmlProps={{ role: 'menu' }}>Card content</Card>
    </TestApp>,
  );

  await expect($).toHaveRole('menu');
  await expect($).toContainText('Card content');
  await expect($).toHaveScreenshot('card.png');
});
