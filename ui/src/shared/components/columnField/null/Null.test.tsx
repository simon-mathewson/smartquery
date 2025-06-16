import { expect, test } from '@playwright/experimental-ct-react';
import type { NullButtonProps } from './Null';
import { NullButton } from './Null';
import { spy } from 'tinyspy';

test('Null', async ({ mount }) => {
  const onChange = spy();

  const props = { isNullable: true, onChange, value: null } satisfies NullButtonProps;

  const $ = await mount(<NullButton {...props} />);

  expect($).toHaveRole('radiogroup');

  const button = $.getByRole('radio', { name: 'NULL' });

  await expect(button).toBeChecked();

  await button.click();
  expect(onChange.calls.length).toBe(0);

  await $.update(<NullButton {...props} value="Value" />);

  await expect(button).not.toBeChecked();

  await button.click();
  expect(onChange.calls.at(-1)?.[0]).toBe(null);
});
