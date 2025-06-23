import { expect, test } from '@playwright/experimental-ct-react';
import {
  expectedConnectInput,
  getProps,
  getStoryProps,
  getValidFormValues,
} from './TestConnection.mocks';
import type { TestConnectionStoryProps } from './TestConnection.story';
import { TestConnectionStory } from './TestConnection.story';

test.describe('TestConnection', () => {
  test('should render button for testing connection if form is valid', async ({ mount }) => {
    const $ = await mount(<TestConnectionStory {...getStoryProps()} />);

    await expect($).toHaveText('Test connection');
    await expect($).toHaveRole('button');
    await expect($).toBeDisabled();
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('disabled.png');

    await $.update(
      <TestConnectionStory
        {...getStoryProps()}
        componentProps={{
          ...getProps(),
          formValues: getValidFormValues(),
        }}
      />,
    );

    await expect($).not.toBeDisabled();
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('enabled.png');
  });

  test('should indicate that test succeeded', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      componentProps: {
        ...getProps(),
        formValues: getValidFormValues(),
      },
    };

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    await expect($).toHaveText('Testing connection...');
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('testing.png');
    await expect($).toBeDisabled();

    await expect($).toHaveText('Connection succeeded');
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('success.png');
    await expect($).not.toBeDisabled();

    expect(props.testApp.providerOverrides.ConnectionsProvider.connectRemote.calls).toEqual([
      [expectedConnectInput],
    ]);
    expect(props.testApp.providerOverrides.ConnectionsProvider.disconnectRemote.calls).toEqual([
      ['1'],
    ]);
  });

  test('should indicate that test failed', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      componentProps: {
        ...getProps(),
        formValues: getValidFormValues(),
      },
      shouldFail: true,
    } satisfies TestConnectionStoryProps;

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    await expect($).toHaveText('Testing connection...');
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('testing.png');
    await expect($).toBeDisabled();

    await expect($).toHaveText('Connection failed');
    // To do: Fix for CI
    // await expect($).toHaveScreenshot('failed.png');
    await expect($).not.toBeDisabled();

    expect(props.testApp.providerOverrides.ConnectionsProvider.connectRemote.calls).toEqual([
      [expectedConnectInput],
    ]);
    expect(props.testApp.providerOverrides.ConnectionsProvider.disconnectRemote.calls).toEqual([]);
  });
});
