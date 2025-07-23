import { expect, test } from '@playwright/experimental-ct-react';
import { CredentialInput, type CredentialInputProps } from './CredentialInput';
import { mockStore, getStoreCalls } from './mockStore';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

const props = {
  htmlProps: { value: 'password\nwith line break' },
  isExistingCredential: true,
  username: 'user',
} satisfies CredentialInputProps;

const passwordWithReplacedLineBreaks = 'password<br />with line break';

test('shows credential input and hidden username input', async ({ mount }) => {
  const onChange = spy();

  const $ = await mount(
    <TestApp>
      <CredentialInput {...props} />
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('credentialInput.png');

  const hiddenUsernameInput = $.locator('input').first();
  await expect(hiddenUsernameInput).toHaveAttribute('autocomplete', 'username');
  await expect(hiddenUsernameInput).toHaveValue(props.username);

  const passwordInput = $.locator('input').last();
  await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  await expect(passwordInput).toHaveAttribute('type', 'password');
  await expect(passwordInput).toHaveValue(passwordWithReplacedLineBreaks);

  await expect($.locator('button')).not.toBeAttached();

  await $.update(
    <TestApp>
      <CredentialInput {...props} isExistingCredential={false} onChange={onChange} />
    </TestApp>,
  );

  await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

  await passwordInput.press('p');

  expect(onChange.calls.at(-1)?.[0]).toBe('p' + props.htmlProps.value);
});

test('allows changing credential and adding it to keychain', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <CredentialInput {...props} showAddToKeychain />
    </TestApp>,
  );
  await mockStore($.page());

  await expect($.page()).toHaveScreenshot('credentialInputWithAddToKeychain.png');

  const addToKeychainButton = $.locator('button').first();
  await addToKeychainButton.click();

  const calls = await getStoreCalls($.page());
  expect(calls).toEqual([{ id: props.username, password: passwordWithReplacedLineBreaks }]);
});

test('allows pasting credentials with line breaks', async ({ mount }) => {
  const onChange = spy();

  const $ = await mount(
    <TestApp>
      <CredentialInput
        {...props}
        htmlProps={{ ...props.htmlProps, value: '' }}
        onChange={onChange}
      />
    </TestApp>,
  );

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
  }, props.htmlProps.value);

  expect(onChange.calls.at(-1)?.[0]).toBe(props.htmlProps.value);
});
