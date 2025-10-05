import { expect, test } from '@playwright/experimental-ct-react';
import { defaultStyleOptions } from '../overlay/styleOptions';
import { OverlayCardStory } from './OverlayCard.story';

test.describe('OverlayCard', () => {
  test('should render overlay card', async ({ mount }) => {
    const $ = await mount(<OverlayCardStory />);
    await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);

    await expect($.page()).toHaveScreenshot('overlayCard.png');
  });
});
