import { expect, test } from '@playwright/experimental-ct-react';
import type { TestConnectionStoryProps } from './TestConnection.story';
import { TestConnectionStory } from './TestConnection.story';
import {
  getStoryProps,
  getProps,
  getValidFormValues,
  expectedConnectInput,
} from './TestConnection.mocks';

test.describe('TestConnection', () => {
  test('should render button for testing connection if form is valid', async ({ mount }) => {
    const $ = await mount(<TestConnectionStory {...getStoryProps()} />);

    await expect($).toHaveText('Test connection');
    await expect($).toHaveRole('button');
    await expect($).toBeDisabled();
    await expect($).toHaveScreenshot('disabled.png');

    await $.update(
      <TestConnectionStory
        {...getStoryProps()}
        props={{
          ...getProps(),
          formValues: getValidFormValues(),
        }}
      />,
    );

    await expect($).not.toBeDisabled();
    await expect($).toHaveScreenshot('enabled.png');
  });

  test('should indicate that test succeeded', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      props: {
        ...getProps(),
        formValues: getValidFormValues(),
      },
    };

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    await expect($).toHaveText('Testing connection...');
    await expect($).toHaveScreenshot('testing.png');
    await expect($).toBeDisabled();

    await expect($).toHaveText('Connection succeeded');
    await expect($).toHaveScreenshot('success.png');
    await expect($).not.toBeDisabled();

    expect(props.mockTrpcClient.connectDb.mutate.calls).toEqual([[expectedConnectInput]]);
    expect(props.mockTrpcClient.disconnectDb.mutate.calls).toEqual([['1']]);
  });

  test('should indicate that test failed', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      props: {
        ...getProps(),
        formValues: getValidFormValues(),
      },
      shouldFail: true,
    } satisfies TestConnectionStoryProps;

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    await expect($).toHaveText('Testing connection...');
    await expect($).toHaveScreenshot('testing.png');
    await expect($).toBeDisabled();

    await expect($).toHaveText('Connection failed');
    await expect($).toHaveScreenshot('failed.png');
    await expect($).not.toBeDisabled();

    expect(props.mockTrpcClient.connectDb.mutate.calls).toEqual([[expectedConnectInput]]);
    expect(props.mockTrpcClient.disconnectDb.mutate.calls).toEqual([]);
  });

  test('should show sign in modal if credentials are required', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      props: {
        ...getProps(),
        formValues: {
          ...getValidFormValues(),
          credentialStorage: 'alwaysAsk',
        },
      },
    } satisfies TestConnectionStoryProps;

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    const modal = $.page().getByRole('dialog');

    await expect(modal).toBeVisible();

    await modal.getByLabel('Password').fill('password');
    await modal.getByRole('button', { name: 'Sign in' }).click();

    await expect(modal).not.toBeAttached();
    await expect($).toHaveText('Connection succeeded');
  });

  test('should show error message in modal if credentials are invalid', async ({ mount }) => {
    const props = {
      ...getStoryProps(),
      props: {
        ...getProps(),
        formValues: {
          ...getValidFormValues(),
          credentialStorage: 'alwaysAsk',
        },
      },
      shouldFailWithAuthError: true,
    } satisfies TestConnectionStoryProps;

    const $ = await mount(<TestConnectionStory {...props} />);

    await $.click();

    const modal = $.page().getByRole('dialog');

    await expect(modal).toBeVisible();

    await modal.getByLabel('Password').fill('password');
    await modal.getByRole('button', { name: 'Sign in' }).click();

    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Authentication failed');
  });
});
