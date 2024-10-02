import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { SignInModalStoryProps } from './SignInModal.story';
import { SignInModalStory } from './SignInModal.story';

const getProps = () =>
  ({
    connectionsContext: {
      activeConnection: {},
    },
    signInModalProps: {
      close: spy(),
      input: {
        connection: {
          credentialStorage: 'alwaysAsk',
          database: 'db',
          engine: 'mysql',
          host: 'localhost',
          id: '1',
          name: 'Test connection',
          password: null,
          port: 1234,
          ssh: null,
          user: 'user',
        },
        onSignIn: spy(),
      },
      isOpen: true,
      open: spy(),
    },
  }) satisfies SignInModalStoryProps;

test.describe('SignInModal', () => {
  test('allows canceling sign in', async ({ mount }) => {
    const props = {
      ...getProps(),
      navigate: spy(),
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);
    await $.page().getByRole('button', { name: 'Cancel' }).click();

    expect(props.signInModalProps.close.calls).toEqual([[]]);

    expect(props.navigate.calls).toEqual([]);
  });

  test('redirects to root on cancel if there is no active connection', async ({ mount }) => {
    const props = {
      ...getProps(),
      connectionsContext: {
        activeConnection: null,
      },
      navigate: spy(),
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);
    await $.page().getByRole('button', { name: 'Cancel' }).click();

    expect(props.signInModalProps.close.calls).toEqual([[]]);

    expect(props.navigate.calls).toEqual([['/']]);
  });

  test('allows signing in if DB password is required', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<SignInModalStory {...props} />);

    await expect($).toHaveScreenshot('db.png');

    await expect($.page().getByRole('textbox', { disabled: true, name: 'User' })).toHaveValue(
      'user@localhost:1234',
    );
    await expect($.page().getByRole('textbox', { name: 'SSH User' })).not.toBeAttached();
    await expect($.page().getByRole('textbox', { name: 'SSH Password' })).not.toBeAttached();

    await $.page().getByRole('textbox', { name: 'Password' }).fill('password');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($.page().getByRole('textbox', { name: 'Password' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.signInModalProps.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: undefined,
          sshPrivateKey: undefined,
        },
      ],
    ]);

    expect(props.signInModalProps.close.calls).toEqual([[]]);
  });

  test('allows signing in if SSH password is required', async ({ mount }) => {
    const props = {
      ...getProps(),
      signInModalProps: {
        ...getProps().signInModalProps,
        input: {
          ...getProps().signInModalProps.input,
          connection: {
            ...getProps().signInModalProps.input.connection,
            credentialStorage: 'localStorage',
            ssh: {
              credentialStorage: 'alwaysAsk',
              host: 'sshhost',
              password: null,
              port: 2345,
              user: 'sshuser',
            },
          },
        },
      },
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);

    await expect($).toHaveScreenshot('sshPassword.png');

    await expect($.page().getByRole('textbox', { disabled: true, name: 'SSH User' })).toHaveValue(
      'sshuser@sshhost:2345',
    );
    await expect($.page().getByRole('textbox', { exact: true, name: 'User' })).not.toBeAttached();
    await expect(
      $.page().getByRole('textbox', { exact: true, name: 'Password' }),
    ).not.toBeAttached();

    await $.page().getByRole('textbox', { name: 'SSH Password' }).fill('password');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($.page().getByRole('textbox', { name: 'SSH Password' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.signInModalProps.input.onSignIn.calls).toEqual([
      [
        {
          password: undefined,
          sshPassword: 'password',
          sshPrivateKey: undefined,
        },
      ],
    ]);

    expect(props.signInModalProps.close.calls).toEqual([[]]);
  });

  test('allows signing in if SSH private key is required', async ({ mount }) => {
    const props = {
      ...getProps(),
      signInModalProps: {
        ...getProps().signInModalProps,
        input: {
          ...getProps().signInModalProps.input,
          connection: {
            ...getProps().signInModalProps.input.connection,
            credentialStorage: 'localStorage',
            ssh: {
              credentialStorage: 'alwaysAsk',
              host: 'sshhost',
              port: 2345,
              privateKey: null,
              user: 'sshuser',
            },
          },
        },
      },
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);

    await expect($).toHaveScreenshot('sshPrivateKey.png');

    await expect($.page().getByRole('textbox', { disabled: true, name: 'SSH User' })).toHaveValue(
      'sshuser@sshhost:2345',
    );
    await expect($.page().getByRole('textbox', { exact: true, name: 'User' })).not.toBeAttached();
    await expect(
      $.page().getByRole('textbox', { exact: true, name: 'Password' }),
    ).not.toBeAttached();
    await expect($.page().getByRole('textbox', { name: 'SSH Password' })).not.toBeAttached();

    await $.page().getByRole('textbox', { name: 'SSH Private key' }).fill('private key');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($.page().getByRole('textbox', { name: 'SSH Private key' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.signInModalProps.input.onSignIn.calls).toEqual([
      [
        {
          password: undefined,
          sshPassword: undefined,
          sshPrivateKey: 'private key',
        },
      ],
    ]);

    expect(props.signInModalProps.close.calls).toEqual([[]]);
  });

  test('allows signing in if both DB and SSH password are required', async ({ mount }) => {
    const props = {
      ...getProps(),
      signInModalProps: {
        ...getProps().signInModalProps,
        input: {
          ...getProps().signInModalProps.input,
          connection: {
            ...getProps().signInModalProps.input.connection,
            password: null,
            ssh: {
              credentialStorage: 'alwaysAsk',
              host: 'sshhost',
              password: null,
              port: 2345,
              user: 'sshuser',
            },
          },
        },
      },
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);

    await expect($).toHaveScreenshot('dbAndSshPassword.png');

    await expect(
      $.page().getByRole('textbox', { disabled: true, exact: true, name: 'User' }),
    ).toHaveValue('user@localhost:1234');
    await expect($.page().getByRole('textbox', { name: 'SSH User' })).toHaveValue(
      'sshuser@sshhost:2345',
    );

    await $.page().getByRole('textbox', { exact: true, name: 'Password' }).fill('password');
    await $.page().getByRole('textbox', { name: 'SSH Password' }).fill('ssh password');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($.page().getByRole('textbox', { name: 'SSH Password' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.signInModalProps.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: 'ssh password',
          sshPrivateKey: undefined,
        },
      ],
    ]);

    expect(props.signInModalProps.close.calls).toEqual([[]]);
  });

  test('shows error message if authentication fails', async ({ mount }) => {
    const props = {
      ...getProps(),
      showError: true,
    } satisfies SignInModalStoryProps;

    const $ = await mount(<SignInModalStory {...props} />);

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($).toHaveScreenshot('authFailed.png');
  });
});
