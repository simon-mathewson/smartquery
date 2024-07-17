import { expect, test } from '@playwright/experimental-ct-react';
import { ModalStory } from './Modal.story';
import { animationOptions } from '../overlayCard/constants';

test.describe('Modal', () => {
  test('should render the modal', async ({ mount }) => {
    const props = {
      children: 'Content',
      subtitle: 'Subtitle',
      title: 'Title',
    };

    const $ = await mount(<ModalStory {...props} />);
    await $.page().waitForTimeout(animationOptions.duration);

    const overlay = $.page().locator('#overlay');

    await expect(overlay).toContainText('Title');
    await expect(overlay).toContainText('Subtitle');
    await expect(overlay).toContainText('Content');
  });
});
