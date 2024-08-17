import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import { FocusFirstControlStory } from './focusFirstControl.story';
import { autoFocusClass } from './focusFirstControl';

test.describe('focusFirstControl', () => {
  const isControlFocused = ($: MountResult, index: number) =>
    $.evaluate(
      (_, innerIndex) => document.activeElement === document.querySelectorAll('button')[innerIndex],
      index,
    );

  const expectControlToBeFocused = async ($: MountResult, index: number) =>
    expect(await isControlFocused($, index)).toBe(true);

  test('should focus first control', async ({ mount }) => {
    const $ = await mount(<FocusFirstControlStory controls={[{}, {}]} />);

    await expectControlToBeFocused($, 0);
  });

  test('should skip hidden controls', async ({ mount }) => {
    const $ = await mount(<FocusFirstControlStory controls={[{ className: 'hidden' }, {}]} />);

    await expectControlToBeFocused($, 1);
  });

  test('should skip disabled controls', async ({ mount }) => {
    const $ = await mount(<FocusFirstControlStory controls={[{ disabled: true }, {}]} />);

    await expectControlToBeFocused($, 1);
  });

  test('should abort if there is a focused control', async ({ mount }) => {
    const $ = await mount(<FocusFirstControlStory controls={[{}, { isFocused: true }]} />);

    await expectControlToBeFocused($, 1);
  });

  test('should focus control with autoFocus', async ({ mount }) => {
    const $ = await mount(<FocusFirstControlStory controls={[{}, { autoFocus: true }]} />);

    await expectControlToBeFocused($, 1);
  });

  test('should focus control with focus class', async ({ mount }) => {
    const $ = await mount(
      <FocusFirstControlStory controls={[{}, { className: autoFocusClass }]} />,
    );

    await expectControlToBeFocused($, 1);
  });
});
