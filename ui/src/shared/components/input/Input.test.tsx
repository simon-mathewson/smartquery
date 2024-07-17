import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { InputProps } from './Input';
import { Input } from './Input';
import type { Page } from '@playwright/test';

const getHeight = (page: Page) =>
  page.evaluate(() => document.querySelector('textarea')!.offsetHeight);

test('Input renders and allows changing text', async ({ mount }) => {
  const onChange = spy();

  const props = {
    autoFocus: true,
    onChange,
    placeholder: 'Placeholder',
    value: 'Test',
  } satisfies InputProps;

  const $ = await mount(<Input {...props} />);

  await expect($).toHaveRole('textbox');
  await expect($).toHaveValue(props.value);
  await expect($).toBeFocused();

  // Expect value to be selected
  const selectionStart = await $.evaluate(
    () => (document.activeElement as HTMLInputElement).selectionStart,
  );
  const selectionEnd = await $.evaluate(
    () => (document.activeElement as HTMLInputElement).selectionEnd,
  );
  expect(selectionStart).toBe(0);
  expect(selectionEnd).toBe(props.value.length);

  const newValue = 'New text';
  await $.fill(newValue);
  expect(onChange.calls.at(-1)?.[0]).toBe(newValue);

  await $.update(<Input {...props} value="" />);

  await expect($.page().getByPlaceholder('Placeholder')).toBeAttached();
});

test('Textarea resizes', async ({ mount }) => {
  const onChange = spy();

  const props = {
    element: 'textarea',
    onChange,
    value: 'Test',
  } satisfies InputProps;

  const $ = await mount(<Input {...props} />);

  expect($).toHaveRole('textbox');
  expect($).toHaveValue(props.value);

  expect(await getHeight($.page())).toBe(36);

  const valueWithLineBreaks =
    'New text\nNew line\nNew text\nNew line\nNew line\nNew line\nNew line\nNew text\nNew line\nNew text\nNew line\nNew line';

  await $.update(<Input {...props} value={valueWithLineBreaks} />);
  // Trigger onChange
  await $.fill(valueWithLineBreaks);

  expect(await getHeight($.page())).toBe(200);

  const shorterValueWithLineBreaks = valueWithLineBreaks.slice(0, 30);

  await $.update(<Input {...props} value={shorterValueWithLineBreaks} />);
  // Trigger onChange
  await $.fill(shorterValueWithLineBreaks);

  expect(await getHeight($.page())).toBeLessThan(200);
});
