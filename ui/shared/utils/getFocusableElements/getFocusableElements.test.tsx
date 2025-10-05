import { expect, test } from '@playwright/experimental-ct-react';
import { GetFocusableElementsStory } from './getFocusableElements.story';

test('getFocusableElements returns all focusable elements', async ({ mount }) => {
  const $ = await mount(<GetFocusableElementsStory />);

  const focusableElementTagNames = await $.locator('[data-focusable=true]').evaluateAll((els) =>
    els.map((el) => el.tagName),
  );

  expect(focusableElementTagNames).toEqual([
    'A',
    'BUTTON',
    'INPUT',
    'TEXTAREA',
    'SELECT',
    'DETAILS',
    'DIV',
  ]);
});
