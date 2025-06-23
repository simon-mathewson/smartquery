import { expect, test } from '@playwright/experimental-ct-react';
import { ModalStory } from './Modal.story';
import { animationOptions } from '../overlayCard/constants';
import { spy } from 'tinyspy';

test.describe('Modal', () => {
  test('should render the modal', async ({ mount }) => {
    const close = spy();

    const props = {
      children: 'Content',
      close,
      subtitle: 'Subtitle',
      title: 'Title',
    };

    const $ = await mount(<ModalStory componentProps={props} />);

    await $.page().waitForTimeout(animationOptions.duration);

    await expect($.page()).toHaveScreenshot('modal.png');

    const overlay = $.page().locator('#overlay');
    const modal = overlay.getByRole('dialog');

    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    const title = modal.getByText(props.title, { exact: true });
    const subtitle = modal.getByText(props.subtitle);

    await expect(modal).toHaveAttribute('aria-labelledby', (await title.getAttribute('id')) ?? '');
    await expect(modal).toHaveAttribute(
      'aria-describedby',
      (await subtitle.getAttribute('id')) ?? '',
    );

    await expect(title).toBeVisible();
    expect(await title.evaluate((el) => el.tagName)).toBe('H1');

    await expect(subtitle).toBeVisible();
    expect(await subtitle.evaluate((el) => el.tagName)).toBe('H2');

    await expect(modal).toContainText(props.children);

    // Should not close on outside click
    await $.page().mouse.click(0, 0);
    await $.page().waitForTimeout(animationOptions.duration);

    expect(close.calls).toEqual([]);
  });
});
