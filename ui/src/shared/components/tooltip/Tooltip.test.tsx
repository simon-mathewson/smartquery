import { expect, test } from '@playwright/experimental-ct-react';

import { TooltipStory } from './Tooltip.story';
import { defaultStyleOptions } from '../overlay/styleOptions';

test('renders tooltip', async ({ mount }) => {
  const $ = await mount(<TooltipStory text="Tooltip" />);

  await expect($.page().locator('#overlay')).not.toContainText('Tooltip');

  await $.getByText('Test').hover();

  await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

  await expect($.page()).toHaveScreenshot('tooltip.png');
  await expect($.page().locator('#overlay')).toContainText('Tooltip');
});

test('renders long tooltip', async ({ mount }) => {
  const $ = await mount(
    <TooltipStory text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />,
  );

  await $.getByText('Test').hover();

  await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

  await expect($.page()).toHaveScreenshot('tooltipLong.png');
});

test('closes when moving cursor away', async ({ mount }) => {
  const $ = await mount(<TooltipStory text="Tooltip" />);

  await $.getByText('Test').hover();

  await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

  await $.page().mouse.move(100, 100);

  await expect($.page().locator('#overlay')).not.toContainText('Tooltip');
});

test('closes when scrolling', async ({ mount }) => {
  const $ = await mount(<TooltipStory text="Tooltip" />);

  await $.getByText('Test').hover();

  await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

  await $.page().mouse.wheel(0, 100);

  await expect($.page().locator('#overlay')).not.toContainText('Tooltip');
});

test('renders only children if text is empty', async ({ mount }) => {
  const $ = await mount(<TooltipStory text="" />);

  await $.getByText('Test').hover();

  await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

  await expect($.page().locator('#overlay')).not.toContainText('Tooltip');
});
