import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { SshFormSectionProps } from './SshFormSection';
import { SshFormSectionStory } from './SshFormSection.story';

export const getProps = () =>
  ({
    setFormValue: spy(),
    formValues: {
      credentialStorage: 'plain',
      ssh: {
        credentialType: 'password',
        host: 'localhost',
        password: 'password',
        port: 22,
        privateKey: '',
        user: 'root',
      },
    },
  }) satisfies SshFormSectionProps;

test.describe('SshFormSection', () => {
  test('allows toggling SSH', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: {
            ...props.formValues,
            ssh: null,
            credentialStorage: 'plain',
          },
        }}
      />,
    );

    const toggle = $.getByRole('checkbox', { name: 'Connect via SSH' });

    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.click();

    expect(props.setFormValue.calls).toEqual([
      [
        'ssh',
        {
          credentialStorage: 'alwaysAsk',
          credentialType: 'password',
          host: '',
          password: '',
          port: null,
          privateKey: '',
          user: '',
        },
      ],
    ]);

    await $.update(<SshFormSectionStory componentProps={props} />);

    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    await toggle.click();

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh', null]]);
  });

  test('controls should be hidden if SSH is disabled', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: { ...props.formValues, ssh: null },
        }}
      />,
    );

    await expect($.getByRole('textbox', { name: 'Host' })).not.toBeAttached();

    await expect($.getByRole('spinbutton', { name: 'Port' })).not.toBeAttached();

    await expect(
      $.getByRole('radiogroup', { name: 'Credential type' }).getByRole('radio', { checked: true }),
    ).not.toBeAttached();

    await expect(
      $.getByRole('radiogroup', { name: 'Password storage' }).getByRole('radio', { checked: true }),
    ).not.toBeAttached();

    await expect($.getByRole('textbox', { name: 'User' })).not.toBeAttached();
  });

  test('controls should be visible if SSH is enabled', async ({ mount }) => {
    const $ = await mount(<SshFormSectionStory componentProps={getProps()} />);

    await expect($.getByRole('textbox', { name: 'Host' })).toHaveValue('localhost');

    await expect($.getByRole('spinbutton', { name: 'Port' })).toHaveValue('22');

    await expect(
      $.getByRole('radiogroup', { name: 'Credential type' }).getByRole('radio', { checked: true }),
    ).toHaveText('Password');

    await expect($.getByRole('textbox', { name: 'User' })).toHaveValue('root');
  });

  test('allows changing SSH settings', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(<SshFormSectionStory componentProps={props} />);

    await $.getByRole('textbox', { name: 'Host' }).fill('example.com');

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.host', 'example.com']]);

    await $.getByRole('spinbutton', { name: 'Port' }).fill('2222');

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.port', 2222]]);

    await $.getByRole('radiogroup', { name: 'Credential type' })
      .getByRole('radio', { name: 'Private key' })
      .click();

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.credentialType', 'privateKey']]);

    await $.getByRole('textbox', { name: 'User' }).fill('user');

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.user', 'user']]);
  });

  test('shows private key or password field if plain storage is selected', async ({ mount }) => {
    const props = getProps();

    const $ = await mount(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: { ...props.formValues, credentialStorage: 'alwaysAsk' },
        }}
      />,
    );

    const privateKeyInput = $.getByRole('textbox', { name: 'Private key' }).last();
    const passwordInput = $.getByRole('textbox', { name: 'Password' }).last();

    await expect(privateKeyInput).not.toBeAttached();
    await expect(passwordInput).not.toBeAttached();

    await $.update(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: {
            ...props.formValues,
            ssh: { ...props.formValues.ssh },
            credentialStorage: 'plain',
          },
        }}
      />,
    );

    await expect(privateKeyInput).not.toBeAttached();

    await passwordInput.fill('test');

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.password', 'test']]);

    await $.update(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: {
            ...props.formValues,
            ssh: {
              ...props.formValues.ssh,
              credentialType: 'privateKey',
            },
            credentialStorage: 'plain',
          },
        }}
      />,
    );

    await expect(passwordInput).not.toBeAttached();

    await privateKeyInput.fill('private key');

    expect(props.setFormValue.calls.slice(-1)).toEqual([['ssh.privateKey', 'private key']]);
  });

  test('allows specifying private key passphrase', async ({ mount }) => {
    const props = {
      ...getProps(),
      formValues: {
        ...getProps().formValues,
        ssh: { ...getProps().formValues.ssh, credentialType: 'privateKey' },
      },
    } satisfies SshFormSectionProps;

    const $ = await mount(<SshFormSectionStory componentProps={props} />);

    const privateKeyInput = $.getByRole('textbox', { name: 'Private key' }).last();
    const passphraseInput = $.getByRole('textbox', { name: 'Passphrase' }).last();

    await expect(privateKeyInput).toBeAttached();
    await expect(passphraseInput).not.toBeAttached();

    const toggle = $.getByRole('checkbox', { name: 'Key encrypted with passphrase' });
    await expect(toggle).not.toBeChecked();

    await $.update(
      <SshFormSectionStory
        componentProps={{
          ...props,
          formValues: {
            ...props.formValues,
            ssh: { ...props.formValues.ssh, privateKeyPassphrase: '' },
          },
        }}
      />,
    );

    await expect(passphraseInput).toBeAttached();
    await expect(toggle).toBeChecked();

    await passphraseInput.fill('passphrase');

    expect(props.setFormValue.calls.slice(-1)).toEqual([
      ['ssh.privateKeyPassphrase', 'passphrase'],
    ]);
  });
});
