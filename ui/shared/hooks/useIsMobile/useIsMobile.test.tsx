import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { UseIsMobileStory } from './useIsMobile.story';
import { TestApp } from '~/test/componentTests/TestApp';

test.describe('useIsMobile', () => {
  test('should return false for desktop viewport (>= 640px)', async ({ mount }) => {
    const mobileChangeSpy = spy();

    const $ = await mount(
      <TestApp>
        <UseIsMobileStory onMobileChange={mobileChangeSpy} />
      </TestApp>,
    );

    await $.page().setViewportSize({ width: 1024, height: 768 });
    await $.page().waitForTimeout(100);

    expect(mobileChangeSpy.calls).toContainEqual([false]);
  });

  test('should return true for mobile viewport (< 640px)', async ({ mount }) => {
    const mobileChangeSpy = spy();

    const $ = await mount(
      <TestApp>
        <UseIsMobileStory onMobileChange={mobileChangeSpy} />
      </TestApp>,
    );

    await $.page().setViewportSize({ width: 480, height: 800 });
    await $.page().waitForTimeout(100);

    expect(mobileChangeSpy.calls).toContainEqual([true]);
  });

  test('should return false for exactly 640px viewport', async ({ mount }) => {
    const mobileChangeSpy = spy();

    const $ = await mount(
      <TestApp>
        <UseIsMobileStory onMobileChange={mobileChangeSpy} />
      </TestApp>,
    );

    await $.page().setViewportSize({ width: 640, height: 800 });
    await $.page().waitForTimeout(100);

    expect(mobileChangeSpy.calls).toContainEqual([false]);
  });

  test('should update when viewport is resized', async ({ mount }) => {
    const mobileChangeSpy = spy();

    const $ = await mount(
      <TestApp>
        <UseIsMobileStory onMobileChange={mobileChangeSpy} />
      </TestApp>,
    );

    await $.page().setViewportSize({ width: 1024, height: 768 });
    await $.page().waitForTimeout(100);

    mobileChangeSpy.calls = [];

    await $.page().setViewportSize({ width: 480, height: 800 });
    await $.page().waitForTimeout(100);

    expect(mobileChangeSpy.calls).toContainEqual([true]);

    await $.page().setViewportSize({ width: 1024, height: 768 });
    await $.page().waitForTimeout(100);

    expect(mobileChangeSpy.calls).toContainEqual([false]);
  });
});
