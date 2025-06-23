import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { type ConfirmDeletePopoverProps } from './ConfirmDeletePopover';
import { ConfirmDeletePopoverStory } from './ConfirmDeletePopover.story';

test('ConfirmDeletePopover', async ({ mount }) => {
  const onConfirm = spy();

  const props = {
    onConfirm,
    text: 'Confirm',
  } satisfies Omit<ConfirmDeletePopoverProps, 'renderTrigger'>;

  const $ = await mount(<ConfirmDeletePopoverStory componentProps={props} />);

  await expect($).toHaveAccessibleName('Delete');
  await expect($).toHaveText('Delete');
  await expect($).toHaveAttribute('aria-expanded', 'false');
  await expect($).toHaveAttribute('aria-haspopup', 'menu');
  await expect($).toHaveAttribute('aria-controls', expect.any(String));

  await $.click();
  await expect($).toHaveAttribute('aria-expanded', 'true');

  const menuId = (await $.getAttribute('aria-controls')) as string;
  const menu = $.page().getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('id', menuId);
  await expect(menu).toHaveAttribute('role', 'menu');

  await expect($.page()).toHaveScreenshot('confirmDeletePopover.png');

  const confirmButton = menu.getByRole('menuitem', { name: 'Confirm' });
  await confirmButton.click();

  expect(onConfirm.calls.length).toBe(1);
});
