import { expect, test } from '@playwright/experimental-ct-react';
import { UseNonEmptyFallbackStory } from './useNonEmptyFallback.story';

test('useNonEmptyFallback should return previous value', async ({ mount }) => {
  const $ = await mount(<UseNonEmptyFallbackStory value={1} />);

  await expect($).toHaveText('undefined');

  await $.update(<UseNonEmptyFallbackStory value={2} />);

  await expect($).toHaveText('1');

  await $.update(<UseNonEmptyFallbackStory value={undefined} />);

  await expect($).toHaveText('2');
});
