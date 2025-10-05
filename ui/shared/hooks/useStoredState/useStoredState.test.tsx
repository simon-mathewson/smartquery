import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import type { UseStoredStateStoryProps } from './useStoredState.story';
import { UseStoredStateStory } from './useStoredState.story';

test.describe('useStoredState', () => {
  const expectReturnValue = async (
    $: MountResult,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    expect(await $.evaluate((root) => root.querySelector('.value')?.textContent)).toBe(
      String(value),
    );
  };

  const expectStoredValue = async (
    $: MountResult,
    props: UseStoredStateStoryProps,
    storedValue: string,
  ) => {
    expect(
      await $.evaluate(
        (_, props) =>
          (props.storage === 'session' ? sessionStorage : localStorage).getItem(props.storageKey!),
        props,
      ),
    ).toEqual(storedValue);
  };

  const expectIsInitialized = async ($: MountResult, isInitialized: boolean) => {
    expect(await $.evaluate((root) => root.querySelector('.is-initialized')?.textContent)).toBe(
      isInitialized ? 'true' : 'false',
    );
  };

  const expectValue = async (
    $: MountResult,
    props: UseStoredStateStoryProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    storedValue: string,
  ) => {
    await expectReturnValue($, value);
    await expectStoredValue($, props, storedValue);
    await expectIsInitialized($, true);
  };

  (['session', 'local'] as const).forEach((storage) => {
    test.describe(storage, () => {
      test('should store and persist state', async ({ mount }) => {
        const props = {
          defaultValue: 'testValue',
          storage,
          storageKey: 'testKey',
        } satisfies UseStoredStateStoryProps;

        const $ = await mount(<UseStoredStateStory {...props} />);

        await expectValue($, props, props.defaultValue, '{"json":"testValue"}');

        await $.update(<UseStoredStateStory {...props} changeValue />);
        await $.update(<UseStoredStateStory {...props} />);

        await expectValue($, props, 'changedValue', '{"json":"changedValue"}');
      });

      test('should store and restore non-primitive values', async ({ mount }) => {
        const props = {
          defaultValue: new Date('2000-01-01'),
          storage,
          storageKey: 'testKey',
        } satisfies UseStoredStateStoryProps;

        const expectedStoredValue =
          '{"json":"2000-01-01T00:00:00.000Z","meta":{"values":["Date"]}}';

        const $ = await mount(<UseStoredStateStory {...props} />);

        await expectValue($, props, props.defaultValue, expectedStoredValue);
      });
    });
  });

  test('allows specifying default value using function', async ({ mount }) => {
    const props = {
      defaultValue: 'testValue',
      storage: 'local',
      storageKey: 'testKey',
      useFunctionForDefaultValue: true,
    } satisfies UseStoredStateStoryProps;

    const $ = await mount(<UseStoredStateStory {...props} />);

    await expectValue($, props, 'testValue', '{"json":"testValue"}');
  });

  test('should handle null key', async ({ mount }) => {
    const props = {
      defaultValue: 'testValue',
      storage: 'local',
      storageKey: null,
    } satisfies UseStoredStateStoryProps;

    const $ = await mount(<UseStoredStateStory {...props} />);

    await expectReturnValue($, 'testValue');
    await expectIsInitialized($, false);

    await $.update(<UseStoredStateStory {...props} storageKey="testKey" />);

    await expectReturnValue($, 'testValue');
    await expectIsInitialized($, true);
  });
});
