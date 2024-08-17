import { expect, test } from '@playwright/experimental-ct-react';
import { UsePreviousStory } from './usePrevious.story';

test('usePrevious should return previous value', async ({ mount }) => {
  const $ = await mount(<UsePreviousStory value={1} />);

  await expect($).toHaveText('undefined');

  await $.update(<UsePreviousStory value={2} />);

  await expect($).toHaveText('1');

  await $.update(<UsePreviousStory value={undefined} />);

  await expect($).toHaveText('2');
});
