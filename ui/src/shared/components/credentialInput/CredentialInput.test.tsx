import { expect, test } from '@playwright/experimental-ct-react';
import { CredentialInput, type CredentialInputProps } from './CredentialInput';
import { mockStore, getStoreCalls } from './mockStore';
import { spy } from 'tinyspy';

const props = {
  isExistingCredential: true,
  username: 'user',
  value: 'password\nwith line break',
} satisfies CredentialInputProps;

const passwordWithReplacedLineBreaks = 'password<br />with line break';

test('shows credential input and hidden username input', async ({ mount }) => {
  const onChange = spy();

  const $ = await mount(<CredentialInput {...props} />);

  const hiddenUsernameInput = $.locator('input').first();
  await expect(hiddenUsernameInput).not.toBeVisible();
  await expect(hiddenUsernameInput).toHaveAttribute('autocomplete', 'username');
  await expect(hiddenUsernameInput).toHaveValue(props.username);

  const passwordInput = $.locator('input').last();
  await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  await expect(passwordInput).toHaveAttribute('type', 'password');
  await expect(passwordInput).toHaveValue(passwordWithReplacedLineBreaks);

  await expect($.locator('button')).not.toBeAttached();

  await $.update(<CredentialInput {...props} isExistingCredential={false} onChange={onChange} />);

  await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

  await passwordInput.press('p');

  expect(onChange.calls.at(-1)?.[0]).toBe('p' + props.value);
});

test('allows changing credential and adding it to keychain', async ({ mount }) => {
  const $ = await mount(<CredentialInput {...props} showAddToKeychain />);
  await mockStore($.page());

  const addToKeychainButton = $.locator('button').first();
  await addToKeychainButton.click();

  const calls = await getStoreCalls($.page());
  expect(calls).toEqual([[{ id: props.username, password: passwordWithReplacedLineBreaks }]]);
});

test('allows pasting credentials with line breaks', async ({ mount }) => {
  const onChange = spy();

  const $ = await mount(<CredentialInput {...props} onChange={onChange} value="" />);

  await $.page().evaluate(async (value) => {
    const clipboardImageHolder = document.querySelectorAll('input')[1];
    clipboardImageHolder.focus();
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer(),
    });

    pasteEvent.clipboardData!.setData('text/plain', value);

    clipboardImageHolder.dispatchEvent(pasteEvent);
  }, props.value);

  expect(onChange.calls.at(-1)?.[0]).toBe(props.value);
});
