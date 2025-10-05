import { expect, test } from '@playwright/experimental-ct-react';
import { OverlayPortal } from './OverlayPortal';
import { TestApp } from '~/test/componentTests/TestApp';

test('OverlayPortal', async ({ mount }) => {
  const text = 'OverlayPortal';

  const $ = await mount(
    <TestApp>
      <OverlayPortal>
        <div className="absolute left-5 top-5">{text}</div>
      </OverlayPortal>
    </TestApp>,
  );

  const overlay = $.page().locator('#overlay');
  const content = overlay.getByText(text);

  await expect(overlay).toHaveText('OverlayPortal');
  await expect(content).toBeVisible();
  await expect(content).toBeInViewport();

  await expect($.page().locator('#root')).toBeEmpty();
});
