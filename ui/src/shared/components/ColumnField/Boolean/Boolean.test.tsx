import { expect, test } from '@playwright/experimental-ct-react';
import type { BooleanFieldProps } from './Boolean';
import { BooleanField } from './Boolean';
import { spy } from 'tinyspy';

test('ColumnField Boolean', async ({ mount }) => {
  const onChange = spy();

  const props = { isNullable: true, onChange, value: 'true' } satisfies BooleanFieldProps;

  const $ = await mount(<BooleanField {...props} />);

  expect($).toHaveRole('radiogroup');

  const getTrue = () => $.getByRole('radio', { name: 'TRUE' });
  const getFalse = () => $.getByRole('radio', { name: 'FALSE' });

  await expect(getTrue()).toBeChecked();
  await expect(getFalse()).not.toBeChecked();

  await getTrue().click();
  expect(onChange.calls.at(-1)?.[0]).toBe(null);

  await getFalse().click();
  expect(onChange.calls.at(-1)?.[0]).toBe('FALSE');

  await $.update(<BooleanField {...props} isNullable={false} />);

  onChange.reset();
  await getTrue().click();
  expect(onChange.calls.length).toBe(0);

  await $.update(<BooleanField {...props} value="false" />);

  await expect(getTrue()).not.toBeChecked();
  await expect(getFalse()).toBeChecked();

  await getTrue().click();
  expect(onChange.calls.at(-1)?.[0]).toBe('TRUE');
});
