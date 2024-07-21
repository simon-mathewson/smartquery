import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { OverlayCardStory } from './OverlayCard.story';
import { animationOptions } from './constants';

test.describe('OverlayCard', () => {
  const getOverlayCard = ($: MountResult) => $.page().locator('#overlay').getByRole('dialog');
  const getTrigger = ($: MountResult) => $.page().getByRole('button', { name: 'Open' });

  test('should render the overlay card below the trigger and allow closing it', async ({
    mount,
  }) => {
    const $ = await mount(<OverlayCardStory isOpen />);
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);

    await expect(card).toBeVisible();
    await expect(card).not.toHaveAttribute('aria-modal');
    await expect(card).toContainText('Content');

    const trigger = getTrigger($);
    expect(await card.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(
      await trigger.evaluate((el) => el.getBoundingClientRect().bottom),
    );
    expect(await card.evaluate((el) => el.getBoundingClientRect().left)).toBe(
      await trigger.evaluate((el) => el.getBoundingClientRect().left),
    );

    const closeButton = card.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(card).not.toBeAttached();
  });

  test('should allow navigating by keyboard', async ({ mount }) => {
    const $ = await mount(<OverlayCardStory />);

    const card = getOverlayCard($);
    await expect(card).not.toBeAttached();

    const trigger = getTrigger($);

    await trigger.click();
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(card).toBeVisible();

    // Expect first control to be focused
    await expect(card.getByRole('textbox')).toBeFocused();

    await $.page().keyboard.press('Tab');
    await expect(card.getByRole('button', { name: 'Close' })).toBeFocused();

    // Expect focus to be trapped within overlay card
    await $.page().keyboard.press('Tab');
    await expect(card.getByRole('textbox')).toBeFocused();

    await $.page().keyboard.press('Shift+Tab');
    await expect(card.getByRole('button', { name: 'Close' })).toBeFocused();

    // Allow closing the overlay card with Escape
    await $.page().keyboard.press('Escape');
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(card).not.toBeAttached();

    await expect(trigger).toBeFocused();
  });
});
