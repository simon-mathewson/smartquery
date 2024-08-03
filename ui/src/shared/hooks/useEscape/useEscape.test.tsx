import { expect, test } from '@playwright/experimental-ct-react';
import { UseEscapeStory } from './useEscape.story';
import { spy } from 'tinyspy';
import React from 'react';

test.describe('useEscape', () => {
  test('should close on escape key', async ({ mount }) => {
    const handler1 = spy();
    const handler2 = spy();

    const $ = await mount(
      <React.Fragment>
        <UseEscapeStory active handler={handler1} />
        <UseEscapeStory active handler={handler2} />
      </React.Fragment>,
    );

    await $.page().keyboard.press('Escape');

    expect(handler1.calls).toEqual([]);
    expect(handler2.calls).toEqual([[]]);

    await $.update(
      <React.Fragment>
        <UseEscapeStory active handler={handler1} />
        <UseEscapeStory active={false} handler={handler2} />
      </React.Fragment>,
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
      <React.Fragment>
        <UseEscapeStory active handler={handler1} clickOutside />
        <UseEscapeStory active handler={handler2} clickOutside />
      </React.Fragment>,
    );

    await $.page().mouse.click(0, 0);

    expect(handler1.calls).toEqual([]);
    expect(handler2.calls).toEqual([[]]);

    await $.update(
      <React.Fragment>
        <UseEscapeStory active handler={handler1} clickOutside />
        <UseEscapeStory active={false} handler={handler2} clickOutside />
      </React.Fragment>,
    );

    await $.page().mouse.click(0, 0);

    expect(handler1.calls).toEqual([[]]);
    expect(handler2.calls).toEqual([[]]);

    await Promise.all((await $.locator('div').all()).map((div) => div.click()));

    expect(handler1.calls).toEqual([[]]);
    expect(handler2.calls).toEqual([[]]);
  });
});
