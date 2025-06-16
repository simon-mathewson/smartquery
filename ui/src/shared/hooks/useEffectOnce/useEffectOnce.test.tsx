import { expect, test } from '@playwright/experimental-ct-react';
import { UserEffectOnceStory } from './useEffectOnce.story';
import { spy } from 'tinyspy';

test.describe('useEffectOnce', () => {
  test('should run effect once', async ({ mount }) => {
    const effect = spy<never, void>();

    const $ = await mount(<UserEffectOnceStory effect={effect} />);
    await $.page().waitForTimeout(100);

    expect(effect.calls).toEqual([[]]);
  });

  test('should run effect once when enabled', async ({ mount }) => {
    const effect = spy<never, void>();

    const $ = await mount(<UserEffectOnceStory effect={effect} options={{ enabled: false }} />);
    await $.page().waitForTimeout(100);

    expect(effect.calls).toEqual([]);

    await $.update(<UserEffectOnceStory effect={effect} options={{ enabled: true }} />);
    await $.page().waitForTimeout(100);

    expect(effect.calls).toEqual([[]]);

    await $.update(<UserEffectOnceStory effect={effect} options={{ enabled: false }} />);
    await $.page().waitForTimeout(100);
    await $.update(<UserEffectOnceStory effect={effect} options={{ enabled: true }} />);
    await $.page().waitForTimeout(100);

    expect(effect.calls).toEqual([[]]);
  });
});
