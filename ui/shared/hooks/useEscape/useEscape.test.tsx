import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { UseEscapeStory } from './useEscape.story';
import { TestApp } from '~/test/componentTests/TestApp';

test.describe('useEscape', () => {
  test('should close on escape key', async ({ mount }) => {
    const handler1 = spy();
    const handler2 = spy();

    const $ = await mount(
      <TestApp>
        <UseEscapeStory active handler={handler1} />
        <UseEscapeStory active handler={handler2} />
      </TestApp>,
    );

    await $.page().keyboard.press('Escape');

    expect(handler1.calls).toEqual([]);
    expect(handler2.calls).toEqual([[]]);

    await $.update(
      <TestApp>
        <UseEscapeStory active handler={handler1} />
        <UseEscapeStory active={false} handler={handler2} />
      </TestApp>,
    );

    await $.page().keyboard.press('Escape');

    expect(handler1.calls).toEqual([[]]);
    expect(handler2.calls).toEqual([[]]);

    await $.page().mouse.click(0, 0);
    expect(handler1.calls).toEqual([[]]);
  });

  test('should close on outside click', async ({ mount }) => {
    const handler1 = spy();
    const handler2 = spy();

    const $ = await mount(
      <TestApp>
        <UseEscapeStory active handler={handler1} clickOutside />
        <UseEscapeStory active handler={handler2} clickOutside />
      </TestApp>,
    );

    await $.page().mouse.click(0, 0);

    expect(handler1.calls).toEqual([]);
    expect(handler2.calls).toEqual([[]]);

    await $.update(
      <TestApp>
        <UseEscapeStory active handler={handler1} clickOutside />
        <UseEscapeStory active={false} handler={handler2} clickOutside />
      </TestApp>,
    );

    await $.page().mouse.click(0, 0);

    expect(handler1.calls).toEqual([[]]);
    expect(handler2.calls).toEqual([[]]);

    await $.locator('div').first().click();
    expect(handler1.calls).toEqual([[]]);

    await $.locator('div').last().click();
    expect(handler1.calls).toEqual([[], []]);
  });
});
