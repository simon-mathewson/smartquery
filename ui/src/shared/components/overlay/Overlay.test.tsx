import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { OverlayStory } from './Overlay.story';
import { animationOptions, overlayMargin } from './constants';
import type { OverlayProps } from './Overlay';
import { spy } from 'tinyspy';

test.describe('Overlay', () => {
  const getOverlay = ($: MountResult) => $.page().locator('#overlay > div > div');
  const getTrigger = ($: MountResult) => $.page().getByRole('button', { name: 'Open' });

  test('should render the overlay below the trigger and allow closing it', async ({ mount }) => {
    const onClose = spy();
    const onOpen = spy();

    const $ = await mount(
      <OverlayStory
        componentProps={{ htmlProps: { className: 'w-[200px]' }, isOpen: true, onClose, onOpen }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    await expect($.page()).toHaveScreenshot('overlay.png');

    expect(onOpen.calls).toEqual([[]]);

    const overlay = getOverlay($);

    await expect(overlay).toBeVisible();
    await expect(overlay).not.toHaveAttribute('aria-modal');
    await expect(overlay).toContainText('Content');

    const trigger = getTrigger($);
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(
      await trigger.evaluate((el) => el.getBoundingClientRect().bottom),
    );
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      await trigger.evaluate((el) => el.getBoundingClientRect().left),
      -0.5,
    );

    const closeButton = overlay.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(overlay).not.toBeAttached();

    expect(onClose.calls).toEqual([[]]);
  });

  test('should allow navigating by keyboard', async ({ mount }) => {
    const $ = await mount(
      <OverlayStory componentProps={{ htmlProps: { className: 'w-[200px]' } }} trigger />,
    );

    const overlay = getOverlay($);
    await expect(overlay).not.toBeAttached();

    const trigger = getTrigger($);

    await trigger.click();
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(overlay).toBeVisible();

    // Expect first control to be focused
    await expect(overlay.getByRole('textbox')).toBeFocused();

    await $.page().keyboard.press('Tab');
    await expect(overlay.getByRole('button', { name: 'Close' })).toBeFocused();

    // Expect focus to be trapped within overlay
    await $.page().keyboard.press('Tab');
    await expect(overlay.getByRole('textbox')).toBeFocused();

    await $.page().keyboard.press('Shift+Tab');
    await expect(overlay.getByRole('button', { name: 'Close' })).toBeFocused();

    // Allow closing the overlay overlay with Escape
    await $.page().keyboard.press('Escape');
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(overlay).not.toBeAttached();

    await expect(trigger).toBeFocused();
  });

  test('should render overlay above trigger when there is not enough space below', async ({
    mount,
  }) => {
    const $ = await mount(
      <OverlayStory
        componentProps={{ htmlProps: { className: 'w-[200px]' }, isOpen: true }}
        trigger={{ htmlProps: { className: 'fixed bottom-0' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = getOverlay($);

    await expect(overlay).toBeVisible();

    const trigger = getTrigger($);
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().bottom)).toBeCloseTo(
      (await trigger.evaluate((el) => el.getBoundingClientRect().top)) - overlayMargin,
      -0.5,
    );
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      await trigger.evaluate((el) => el.getBoundingClientRect().left),
      -0.5,
    );
  });

  test('should render overlay left of trigger when there is not enough space on the right', async ({
    mount,
  }) => {
    const $ = await mount(
      <OverlayStory
        componentProps={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger={{ htmlProps: { className: 'fixed right-0' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = getOverlay($);

    await expect(overlay).toBeVisible();

    const trigger = getTrigger($);
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(
      (await trigger.evaluate((el) => el.getBoundingClientRect().bottom)) + overlayMargin,
      -0.5,
    );
    expect(
      await overlay.evaluate((el) => window.innerWidth - el.getBoundingClientRect().right),
    ).toBeCloseTo(overlayMargin, -0.5);
  });

  test.describe('allows aligning the overlay relative to the trigger', () => {
    (['left', 'center', 'right'] as const).forEach((align) => {
      test(align, async ({ mount }) => {
        const $ = await mount(
          <OverlayStory
            componentProps={{
              htmlProps: { className: 'w-[200px]' },
              isOpen: true,
              align,
            }}
            trigger
          />,
        );
        await $.page().waitForTimeout(animationOptions.duration);

        const overlay = getOverlay($);
        await expect(overlay).toBeVisible();

        const trigger = getTrigger($);

        switch (align) {
          case 'left':
            expect(await overlay.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
              await trigger.evaluate((el) => el.getBoundingClientRect().left),
              -0.5,
            );
            break;
          case 'center':
            expect(
              (await overlay.evaluate((el) => el.getBoundingClientRect().left)) -
                (await trigger.evaluate((el) => el.getBoundingClientRect().left)),
            ).toBeCloseTo(
              (await trigger.evaluate((el) => el.getBoundingClientRect().right)) -
                (await overlay.evaluate((el) => el.getBoundingClientRect().right)),
              -0.5,
            );
            break;
          case 'right':
            expect(await overlay.evaluate((el) => el.getBoundingClientRect().right)).toBeCloseTo(
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
  ] satisfies OverlayProps['position'][];

  test.describe('allows specifying the position of the overlay without trigger', () => {
    scenarios.forEach((position) => {
      test(`${position.y} ${position.x}`, async ({ mount }) => {
        const $ = await mount(
          <OverlayStory
            componentProps={{
              htmlProps: { className: 'w-[200px]' },
              isOpen: true,
              position,
            }}
          />,
        );
        await $.page().waitForTimeout(animationOptions.duration);

        const overlay = getOverlay($);
        await expect(overlay).toBeVisible();

        const overlayRect = await overlay.evaluate((el) => el.getBoundingClientRect());

        const windowHeight = await $.page().evaluate(() => window.innerHeight);
        const windowWidth = await $.page().evaluate(() => window.innerWidth);

        switch (position.y) {
          case 'top':
            expect(overlayRect.top).toBeCloseTo(overlayMargin, -0.5);
            break;
          case 'center':
            expect(overlayRect.top).toBeCloseTo(windowHeight - overlayRect.bottom, -0.5);
            break;
          case 'bottom':
            expect(overlayRect.bottom).toBeCloseTo(windowHeight - overlayMargin, -0.5);
            break;
        }

        switch (position.x) {
          case 'left':
            expect(overlayRect.left).toBeCloseTo(overlayMargin, -0.5);
            break;
          case 'center':
            expect(overlayRect.left).toBeCloseTo(windowWidth - overlayRect.right, -0.5);
            break;
          case 'right':
            expect(overlayRect.right).toBeCloseTo(windowWidth - overlayMargin, -0.5);
            break;
        }
      });
    });
  });

  test('allows closing the overlay overlay by clicking outside', async ({ mount }) => {
    const $ = await mount(
      <OverlayStory
        componentProps={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = getOverlay($);
    await expect(overlay).toBeVisible();

    await $.page().mouse.click(0, 0);
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(overlay).not.toBeAttached();

    // Allows disable closing on outside click
    await $.update(
      <OverlayStory
        componentProps={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
          closeOnOutsideClick: false,
        }}
      />,
    );

    const newOverlay = getOverlay($);
    await expect(newOverlay).toBeVisible();

    await $.page().mouse.click(0, 0);
    await $.page().waitForTimeout(animationOptions.duration);
    await expect(newOverlay).toBeVisible();
  });

  test('allows specifying the anchor element', async ({ mount }) => {
    const $ = await mount(
      <OverlayStory
        anchor
        componentProps={{
          htmlProps: { className: 'w-[200px]' },
          isOpen: true,
        }}
        trigger
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = getOverlay($);
    await expect(overlay).toBeVisible();

    const anchor = $.page().locator('.bg-red-500');
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(
      (await anchor.evaluate((el) => el.getBoundingClientRect().bottom)) + overlayMargin,
      -0.5,
    );
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().left)).toBeCloseTo(
      (await anchor.evaluate((el) => el.getBoundingClientRect().left)) + overlayMargin,
      -0.5,
    );
  });

  test('allows matching the width of the trigger', async ({ mount }) => {
    const $ = await mount(
      <OverlayStory
        componentProps={{ isOpen: true, matchTriggerWidth: true }}
        trigger={{ htmlProps: { className: 'w-[150px]' } }}
      />,
    );
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = getOverlay($);
    await expect(overlay).toBeVisible();

    const trigger = getTrigger($);
    expect(await overlay.evaluate((el) => el.getBoundingClientRect().width)).toBe(
      await trigger.evaluate((el) => el.getBoundingClientRect().width),
    );
  });

  test('darkens background unless specified otherwise', async ({ mount }) => {
    const $ = await mount(
      <OverlayStory
        componentProps={{
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
      <OverlayStory
        componentProps={{
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
