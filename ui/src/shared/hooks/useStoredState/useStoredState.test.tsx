import type { MountResult } from '@playwright/experimental-ct-react';
import { expect, test } from '@playwright/experimental-ct-react';
import type { UseStoredStateStoryProps } from './useStoredState.story';
import { UseStoredStateStory } from './useStoredState.story';

test.describe('useStoredState', () => {
  const expectValue = async (
    $: MountResult,
    props: UseStoredStateStoryProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    storedValue: string,
  ) => {
    await expect($).toHaveText(String(value));

    expect(
      await $.evaluate(
        (_, props) =>
          (props.storage === 'session' ? sessionStorage : localStorage).getItem(props.storageKey),
        props,
      ),
    ).toEqual(storedValue);
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
});
