import { expect, test } from '@playwright/experimental-ct-react';
import { Field } from './Field';
import { Input } from '../input/Input';
import { assert } from 'ts-essentials';
import { TestApp } from '~/test/componentTests/TestApp';

test('Field renders label and children', async ({ mount }) => {
  const label = 'Name';
  const hint = 'This is a hint';

  const $ = await mount(
    <TestApp>
      <Field hint={hint} label={label}>
        <Input />
      </Field>
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('field.png');

  const labelEl = $.getByText(label);
  const controlId = await labelEl.getAttribute('for');
  const input = $.getByRole('textbox');

  expect(controlId).not.toBeNull();
  assert(controlId !== null);

  expect($.getByText(label)).toHaveAttribute('for', controlId);
  expect(input).toHaveAttribute('id', controlId);
  expect(input).toHaveAccessibleName(label);
  expect(input).toHaveAccessibleDescription(hint);

  await $.update(
    <TestApp>
      <Field>
        <Input />
      </Field>
    </TestApp>,
  );

  await expect($.locator('label')).not.toBeAttached();
  await expect($.getByText(hint)).not.toBeAttached();
});
