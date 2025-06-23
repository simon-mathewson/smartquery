import { expect, test } from '@playwright/experimental-ct-react';
import type { BooleanFieldProps } from './Boolean';
import { BooleanField } from './Boolean';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test('Boolean', async ({ mount }) => {
  const onChange = spy();

  const props = { isNullable: true, onChange, value: 'true' } satisfies BooleanFieldProps;

  const $ = await mount(
    <TestApp>
      <BooleanField {...props} />
    </TestApp>,
  );

  await expect($).toHaveScreenshot('boolean.png');

  const getTrue = () => $.getByRole('radio', { name: 'TRUE' });
  const getFalse = () => $.getByRole('radio', { name: 'FALSE' });

  await expect(getTrue()).toBeChecked();
  await expect(getFalse()).not.toBeChecked();

  await getTrue().click();
  expect(onChange.calls.at(-1)?.[0]).toBe(null);

  await getFalse().click();
  expect(onChange.calls.at(-1)?.[0]).toBe('FALSE');

  await $.update(
    <TestApp>
      <BooleanField {...props} isNullable={false} />
    </TestApp>,
  );

  onChange.reset();
  await getTrue().click();
  expect(onChange.calls.length).toBe(0);

  await $.update(
    <TestApp>
      <BooleanField {...props} value="false" />
    </TestApp>,
  );

  await expect(getTrue()).not.toBeChecked();
  await expect(getFalse()).toBeChecked();

  await getTrue().click();
  expect(onChange.calls.at(-1)?.[0]).toBe('TRUE');
});
