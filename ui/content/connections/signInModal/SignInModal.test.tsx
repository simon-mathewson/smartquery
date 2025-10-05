import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { SignInModalProps } from './SignInModal';
import { getSignInModalProps } from './SignInModal.mocks';
import { SignInModalStory } from './SignInModal.story';
import { defaultStyleOptions } from '~/shared/components/overlay/styleOptions';

test.use({
  viewport: { width: 400, height: 600 },
});

test.describe('SignInModal', () => {
  test('allows canceling sign in', async ({ mount }) => {
    const props = getSignInModalProps();
    const navigateSpy = spy();

    const $ = await mount(<SignInModalStory componentProps={props} testApp={{ navigateSpy }} />);
    await $.page().getByRole('button', { name: 'Cancel' }).click();

    expect(props.close.calls).toEqual([[]]);

    expect(navigateSpy.calls).toEqual([]);
  });

  test('allows signing in if DB password is required', async ({ mount }) => {
    const props = getSignInModalProps();

    const $ = await mount(<SignInModalStory componentProps={props} />);

    await expect($).toHaveScreenshot('db.png');

    await expect($.page().getByRole('textbox', { disabled: true, name: 'User' })).toHaveValue(
      'user@localhost:1234',
    );
    await expect($.page().getByRole('textbox', { name: 'SSH User' })).not.toBeAttached();
    await expect($.page().getByRole('textbox', { name: 'SSH Password' }).last()).not.toBeAttached();

    const passwordInput = $.page().getByRole('textbox', { name: 'Password' }).last();
    await passwordInput.fill('password');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect(passwordInput).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: undefined,
          sshPrivateKey: undefined,
        },
      ],
    ]);

    expect(props.close.calls).toEqual([[]]);
  });

  test('allows signing in if SSH private key is required', async ({ mount }) => {
    const props = {
      ...getSignInModalProps(),
      input: {
        ...getSignInModalProps().input,
        connection: {
          ...getSignInModalProps().input.connection,
          credentialStorage: 'alwaysAsk',
          ssh: {
            host: 'sshhost',
            port: 2345,
            privateKey: null,
            user: 'sshuser',
          },
        },
      },
    } satisfies SignInModalProps;

    const $ = await mount(<SignInModalStory componentProps={props} />);

    await expect($).toHaveScreenshot('sshPrivateKey.png');

    await expect($.page().getByRole('textbox', { disabled: true, name: 'SSH User' })).toHaveValue(
      'sshuser@sshhost:2345',
    );
    await expect($.page().getByRole('textbox', { exact: true, name: 'User' })).toBeAttached();

    const passwordInput = $.page().getByRole('textbox', { exact: true, name: 'Password' }).last();
    await expect(passwordInput).toBeAttached();

    await expect($.page().getByRole('textbox', { name: 'SSH Password' }).last()).not.toBeAttached();

    await passwordInput.fill('password');

    const privateKeyInput = $.page().getByRole('textbox', { name: 'SSH Private key' }).last();
    await privateKeyInput.fill('private key');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect(privateKeyInput).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: undefined,
          sshPrivateKey: 'private key',
        },
      ],
    ]);

    expect(props.close.calls).toEqual([[]]);
  });

  test('allows signing in if SSH private key and passphrase are required', async ({ mount }) => {
    const props = {
      ...getSignInModalProps(),
      input: {
        ...getSignInModalProps().input,
        connection: {
          ...getSignInModalProps().input.connection,
          credentialStorage: 'alwaysAsk',
          ssh: {
            host: 'sshhost',
            port: 2345,
            privateKey: null,
            privateKeyPassphrase: null,
            user: 'sshuser',
          },
        },
      },
    } satisfies SignInModalProps;

    const $ = await mount(<SignInModalStory componentProps={props} />);

    await expect($).toHaveScreenshot('sshPrivateKeyWithPassphrase.png');

    await $.page().getByRole('textbox', { exact: true, name: 'Password' }).last().fill('password');

    await $.page().getByRole('textbox', { name: 'SSH Private key' }).last().fill('private key');

    const passphraseInput = $.page().getByRole('textbox', { name: 'Passphrase' }).last();
    await passphraseInput.fill('passphrase');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect(passphraseInput).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: undefined,
          sshPrivateKey: 'private key',
          sshPrivateKeyPassphrase: 'passphrase',
        },
      ],
    ]);
  });

  test('allows signing in if SSH password is required', async ({ mount }) => {
    const props = {
      ...getSignInModalProps(),
      input: {
        ...getSignInModalProps().input,
        connection: {
          ...getSignInModalProps().input.connection,
          password: null,
          ssh: {
            host: 'sshhost',
            password: null,
            port: 2345,
            user: 'sshuser',
          },
        },
      },
    } satisfies SignInModalProps;

    const $ = await mount(<SignInModalStory componentProps={props} />);

    await $.page().waitForTimeout(defaultStyleOptions.animationOptions.duration);
    await expect($).toHaveScreenshot('sshPassword.png');

    await expect(
      $.page().getByRole('textbox', { disabled: true, exact: true, name: 'User' }),
    ).toHaveValue('user@localhost:1234');
    await expect($.page().getByRole('textbox', { name: 'SSH User' })).toHaveValue(
      'sshuser@sshhost:2345',
    );

    await $.page().getByRole('textbox', { exact: true, name: 'Password' }).last().fill('password');

    const sshPasswordInput = $.page().getByRole('textbox', { name: 'SSH Password' }).last();
    await sshPasswordInput.fill('ssh password');

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect(sshPasswordInput).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect($.page().getByRole('button', { name: 'Sign in' })).toBeDisabled();

    await $.page().waitForTimeout(1000);

    expect(props.input.onSignIn.calls).toEqual([
      [
        {
          password: 'password',
          sshPassword: 'ssh password',
          sshPrivateKey: undefined,
        },
      ],
    ]);

    expect(props.close.calls).toEqual([[]]);
  });

  test('shows error message if authentication fails', async ({ mount }) => {
    const $ = await mount(<SignInModalStory componentProps={getSignInModalProps()} showError />);

    await $.page().getByRole('button', { name: 'Sign in' }).click();

    await expect($).toHaveScreenshot('authFailed.png');
  });
});
