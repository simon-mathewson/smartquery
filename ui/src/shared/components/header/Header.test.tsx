import { expect, test } from '@playwright/experimental-ct-react';
import { Header } from './Header';
import { Button } from '../button/Button';
import { Add } from '@mui/icons-material';

test('should display all components', async ({ mount }) => {
  const $ = await mount(
    <Header left={<div>Left</div>} middle={<div>Middle</div>} right={<Button icon={<Add />} />} />,
  );

  expect($).toContainText('Left');
  expect($).toContainText('Middle');

  await expect($.getByRole('button')).toBeAttached();
  await expect($).toHaveCSS('height', '36px');
});
