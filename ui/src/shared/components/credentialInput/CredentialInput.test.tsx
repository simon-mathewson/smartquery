// import { expect, test } from '@playwright/experimental-ct-react';
// import { CredentialInput, type CredentialInputProps } from './CredentialInput';
// import type { Page } from '@playwright/test';
// import { spy } from 'tinyspy';

// test.describe('CredentialInput', () => {
//   const mockCredentialsStore = async (page: Page) => {
//     const s = spy();

//     page.addInitScript(() => {
//       window.navigator = {
//         ...window.navigator,
//         credentials: {
//           ...window.navigator.credentials,
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           store: s as any,
//         },
//       };
//     });

//     await page.reload();

//     return s;
//   };

//   test('shows password input and hidden username input', async ({ mount }) => {
//     const props = {
//       isExistingCredential: true,
//       showAddToKeychain: true,
//       username: 'user',
//       value: 'password',
//     } satisfies CredentialInputProps;

//     const $ = await mount(<CredentialInput {...props} />);

//     const hiddenUsernameInput = $.locator('input').first();
//     await expect(hiddenUsernameInput).not.toBeVisible();
//     await expect(hiddenUsernameInput).toHaveAttribute('autocomplete', 'username');
//     await expect(hiddenUsernameInput).toHaveValue('user');

//     const passwordInput = $.locator('input').last();
//     await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
//     await expect(passwordInput).toHaveAttribute('type', 'password');
//     await expect(passwordInput).toHaveValue('password');
//   });

//   test.only('allows adding password to keychain', async ({ mount }) => {
//     const props = {
//       isExistingCredential: true,
//       showAddToKeychain: true,
//       username: 'user',
//       value: 'password',
//     } satisfies CredentialInputProps;

//     const $ = await mount(<CredentialInput {...props} />);
//     const s = await mockCredentialsStore($.page());

//     const addToKeychainButton = $.locator('button').first();
//     await addToKeychainButton.click();

//     expect(s.calls).toHaveLength(1);
//   });
// });
