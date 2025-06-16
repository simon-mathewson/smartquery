import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { OverlayCardStory } from './OverlayCard.story';
import { animationOptions, overlayCardMargin } from './constants';
import type { OverlayCardProps } from './OverlayCard';
import { spy } from 'tinyspy';

test.describe('OverlayCard', () => {
  const getOverlayCard = ($: MountResult) => $.page().locator('#overlay > div > div');
  const getTrigger = ($: MountResult) => $.page().getByRole('button', { name: 'Open' });

  test('should render the overlay card below the trigger and allow closing it', async ({
    mount,
  }) => {
    const onClose = spy();
    const onOpen = spy();

    const $ = await mount(
      <OverlayCardStory
        overlayCard={{ htmlProps: { className: 'w-[200px]' }, isOpen: true, onClose, onOpen }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    expect(onOpen.calls).toEqual([[]]);

    const card = getOverlayCard($);

    await expect(card).toBeVisible();
    await expect(card).not.toHaveAttribute('aria-modal');
    await expect(card).toContainText('Content');

    const trigger = getTrigger($);
    expect(await card.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(
      await trigger.evaluate((el) => el.getBoundingClientRect().bottom),
    );
    expect(await card.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      await trigger.evaluate((el) => el.getBoundingClientRect().left),
      -0.5,
    );

    const closeButton = card.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(card).not.toBeAttached();

    expect(onClose.calls).toEqual([[]]);
  });

  test('should allow navigating by keyboard', async ({ mount }) => {
    const $ = await mount(
      <OverlayCardStory overlayCard={{ htmlProps: { className: 'w-[200px]' } }} trigger />,
    );

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

  test('should render card above trigger when there is not enough space below', async ({
    mount,
  }) => {
    const $ = await mount(
      <OverlayCardStory
        overlayCard={{ htmlProps: { className: 'w-[200px]' }, isOpen: true }}
        trigger={{ htmlProps: { className: 'fixed bottom-0' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);

    await expect(card).toBeVisible();

    const trigger = getTrigger($);
    expect(await card.evaluate((el) => el.getBoundingClientRect().bottom)).toBeCloseTo(
      (await trigger.evaluate((el) => el.getBoundingClientRect().top)) - overlayCardMargin,
      -0.5,
    );
    expect(await card.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      await trigger.evaluate((el) => el.getBoundingClientRect().left),
      -0.5,
    );
  });

  test('should render card left of trigger when there is not enough space on the right', async ({
    mount,
  }) => {
    const $ = await mount(
      <OverlayCardStory
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger={{ htmlProps: { className: 'fixed right-0' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);

    await expect(card).toBeVisible();

    const trigger = getTrigger($);
    expect(await card.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(
      (await trigger.evaluate((el) => el.getBoundingClientRect().bottom)) + overlayCardMargin,
      -0.5,
    );
    expect(
      await card.evaluate((el) => window.innerWidth - el.getBoundingClientRect().right),
    ).toBeCloseTo(overlayCardMargin, -0.5);
  });

  test.describe('allows aligning the card relative to the trigger', () => {
    (['left', 'center', 'right'] as const).forEach((align) => {
      test(align, async ({ mount }) => {
        const $ = await mount(
          <OverlayCardStory
            overlayCard={{
              htmlProps: { className: 'w-[200px]' },
              isOpen: true,
              align,
            }}
            trigger
          />,
        );
        await $.page().waitForTimeout(animationOptions.duration);

        const card = getOverlayCard($);
        await expect(card).toBeVisible();

        const trigger = getTrigger($);

        switch (align) {
          case 'left':
            expect(await card.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
              await trigger.evaluate((el) => el.getBoundingClientRect().left),
              -0.5,
            );
            break;
          case 'center':
            expect(
              (await card.evaluate((el) => el.getBoundingClientRect().left)) -
                (await trigger.evaluate((el) => el.getBoundingClientRect().left)),
            ).toBeCloseTo(
              (await trigger.evaluate((el) => el.getBoundingClientRect().right)) -
                (await card.evaluate((el) => el.getBoundingClientRect().right)),
              -0.5,
            );
            break;
          case 'right':
            expect(await card.evaluate((el) => el.getBoundingClientRect().right)).toBeCloseTo(
              await trigger.evaluate((el) => el.getBoundingClientRect().right),
              -0.5,
            );
            break;
        }
      });
    });
  });

  const scenarios = [
    { x: 'left', y: 'top' },
    { x: 'center', y: 'top' },
    { x: 'right', y: 'top' },
    { x: 'left', y: 'center' },
    { x: 'center', y: 'center' },
    { x: 'right', y: 'center' },
    { x: 'left', y: 'bottom' },
    { x: 'center', y: 'bottom' },
    { x: 'right', y: 'bottom' },
  ] satisfies OverlayCardProps['position'][];

  test.describe('allows specifying the position of the card without trigger', () => {
    scenarios.forEach((position) => {
      test(`${position.y} ${position.x}`, async ({ mount }) => {
        const $ = await mount(
          <OverlayCardStory
            overlayCard={{
              htmlProps: { className: 'w-[200px]' },
              isOpen: true,
              position,
            }}
          />,
        );
        await $.page().waitForTimeout(animationOptions.duration);

        const card = getOverlayCard($);
        await expect(card).toBeVisible();

        const cardRect = await card.evaluate((el) => el.getBoundingClientRect());

        const windowHeight = await $.page().evaluate(() => window.innerHeight);
        const windowWidth = await $.page().evaluate(() => window.innerWidth);

        switch (position.y) {
          case 'top':
            expect(cardRect.top).toBeCloseTo(overlayCardMargin, -0.5);
            break;
          case 'center':
            expect(cardRect.top).toBeCloseTo(windowHeight - cardRect.bottom, -0.5);
            break;
          case 'bottom':
            expect(cardRect.bottom).toBeCloseTo(windowHeight - overlayCardMargin, -0.5);
            break;
        }

        switch (position.x) {
          case 'left':
            expect(cardRect.left).toBeCloseTo(overlayCardMargin, -0.5);
            break;
          case 'center':
            expect(cardRect.left).toBeCloseTo(windowWidth - cardRect.right, -0.5);
            break;
          case 'right':
            expect(cardRect.right).toBeCloseTo(windowWidth - overlayCardMargin, -0.5);
            break;
        }
      });
    });
  });

  test('allows closing the overlay card by clicking outside', async ({ mount }) => {
    const $ = await mount(
      <OverlayCardStory
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);
    await expect(card).toBeVisible();

    await $.page().mouse.click(0, 0);
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(card).not.toBeAttached();

    // Allows disable closing on outside click
    await $.update(
      <OverlayCardStory
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
          closeOnOutsideClick: false,
        }}
      />,
    );

    const newCard = getOverlayCard($);
    await expect(newCard).toBeVisible();

    await $.page().mouse.click(0, 0);
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(newCard).toBeVisible();
  });

  test('allows specifying the anchor element', async ({ mount }) => {
    const $ = await mount(
      <OverlayCardStory
        anchor
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);
    await expect(card).toBeVisible();

    const anchor = $.page().locator('.bg-red-500');
    expect(await card.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(
      (await anchor.evaluate((el) => el.getBoundingClientRect().bottom)) + overlayCardMargin,
      -0.5,
    );
    expect(await card.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      (await anchor.evaluate((el) => el.getBoundingClientRect().left)) + overlayCardMargin,
      -0.5,
    );
  });

  test('allows matching the width of the trigger', async ({ mount }) => {
    const $ = await mount(
      <OverlayCardStory
        overlayCard={{ isOpen: true, matchTriggerWidth: true }}
        trigger={{ htmlProps: { className: 'w-[150px]' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const card = getOverlayCard($);
    await expect(card).toBeVisible();

    const trigger = getTrigger($);
    expect(await card.evaluate((el) => el.getBoundingClientRect().width)).toBe(
      await trigger.evaluate((el) => el.getBoundingClientRect().width),
    );
  });

  test('darkens background unless specified otherwise', async ({ mount }) => {
    const $ = await mount(
      <OverlayCardStory
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
          darkenBackground: true,
        }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const background = $.page().locator('.fixed');
    await expect(background).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.5)');

    await $.unmount();

    const $$ = await mount(
      <OverlayCardStory
        overlayCard={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger
      />,
    );
    await $$.page().waitForTimeout(animationOptions.duration);

    await expect(background).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });
});
