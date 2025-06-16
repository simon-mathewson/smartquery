import { expect, test } from '@playwright/experimental-ct-react';
import { Field } from './Field';
import { Input } from '../input/Input';
import { assert } from 'ts-essentials';

test('Field renders label and children', async ({ mount }) => {
  const label = 'Name';

  const $ = await mount(
    <Field label={label}>
      <Input />
    </Field>,
  );

  const labelEl = $.getByText(label);
  const controlId = await labelEl.getAttribute('for');
  const input = $.getByRole('textbox');

  expect(controlId).not.toBeNull();
  assert(controlId !== null);

  expect($.getByText(label)).toHaveAttribute('for', controlId);
  expect(input).toHaveAttribute('id', controlId);
  expect(input).toHaveAccessibleName(label);

  await $.update(
    <Field>
      <Input />
    </Field>,
  );

  await expect($.locator('label')).not.toBeAttached();
});
