import { expect, test } from '@playwright/experimental-ct-react';
import type { NullButtonProps } from './Null';
import { NullButton } from './Null';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test('Null', async ({ mount }) => {
  const onChange = spy();

  const props = { isNullable: true, onChange, value: null } satisfies NullButtonProps;

  const $ = await mount(
    <TestApp>
      <NullButton {...props} />
    </TestApp>,
  );

  await expect($).toHaveScreenshot('null.png');

  expect($).toHaveRole('radiogroup');

  const button = $.getByRole('radio', { name: 'NULL' });

  await expect(button).toBeChecked();

  await button.click();
  expect(onChange.calls.length).toBe(0);

  await $.update(
    <TestApp>
      <NullButton {...props} value="Value" />
    </TestApp>,
  );

  await expect(button).not.toBeChecked();

  await button.click();
  expect(onChange.calls.at(-1)?.[0]).toBe(null);
});
