import { expect, test } from '@playwright/experimental-ct-react';
import type { SshFormSectionProps } from './SshFormSection';
import { SshFormSection } from './SshFormSection';
import { spy } from 'tinyspy';

const onChange = spy();

const props = {
  getChangeHandler: () => onChange,
  form: {
    ssh: {
      credentialStorage: 'alwaysAsk',
      credentialType: 'password',
      host: 'localhost',
      password: 'password',
      port: 22,
      privateKey: '',
      user: 'root',
    },
  },
} satisfies SshFormSectionProps;

test.describe('SshFormSection', () => {
  test('should render', async ({ mount }) => {
    const $ = await mount(<SshFormSection {...props} />);

    await expect($.getByRole('textbox').first()).toBeAttached();
  });
});
