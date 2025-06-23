import { expect, test } from '@playwright/experimental-ct-react';
import { Header } from './Header';
import { Button } from '../button/Button';
import { Add } from '@mui/icons-material';
import { TestApp } from '~/test/componentTests/TestApp';

test('should display all components', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <Header left={<div>Left</div>} middle={<div>Middle</div>} right={<Button icon={<Add />} />} />
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('header.png');

  expect($).toContainText('Left');
  expect($).toContainText('Middle');

  await expect($.getByRole('button')).toBeAttached();
  await expect($).toHaveCSS('height', '36px');
});
