import { expect, test } from '@playwright/experimental-ct-react';
import { UseDefinedContextStory, UseDefinedContextTestContext } from './useDefinedContext.story';

test.describe('useDefinedContext', () => {
  test('should not throw when context is defined', async ({ mount }) => {
    const $ = await mount(
      <UseDefinedContextTestContext.Provider value>
        <UseDefinedContextStory />
      </UseDefinedContextTestContext.Provider>,
    );

    await expect($).toHaveText('');
  });

  test('should throw when context is not defined', async ({ mount }) => {
    const $ = await mount(<UseDefinedContextStory />);

    await expect($).toHaveText(`Context UseDefinedContextTestContext is not defined`);
  });
});
