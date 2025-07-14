import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import type { InputProps } from './Input';
import { Input } from './Input';
import type { Page } from '@playwright/test';
import { TestApp } from '~/test/componentTests/TestApp';

const getHeight = (page: Page) =>
  page.evaluate(() => document.querySelector('textarea')!.offsetHeight);

test('Input renders and allows changing text', async ({ mount }) => {
  const onChange = spy();

  const props = {
    htmlProps: {
      autoFocus: true,
      placeholder: 'Placeholder',
      value: 'Test',
    },
    onChange,
  } satisfies InputProps;

  const $ = await mount(
    <TestApp>
      <Input {...props} />
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('input.png');

  const element = $.getByRole('textbox');
  await expect(element).toBeAttached();
  await expect(element).toHaveValue(props.htmlProps.value);
  await expect(element).toBeFocused();

  const newValue = 'New text';
  await element.fill(newValue);
  expect(onChange.calls.at(-1)?.[0]).toBe(newValue);

  await $.update(
    <TestApp>
      <Input {...props} htmlProps={{ ...props.htmlProps, value: '' }} />
    </TestApp>,
  );

  await expect($.page().getByPlaceholder('Placeholder')).toBeAttached();
});

test('Textarea resizes', async ({ mount }) => {
  const onChange = spy();

  const props = {
    element: 'textarea',
    htmlProps: { value: 'Test' },
    onChange,
  } satisfies InputProps;

  const $ = await mount(
    <TestApp>
      <Input {...props} />
    </TestApp>,
  );

  await expect($.page()).toHaveScreenshot('textarea.png');

  const element = $.getByRole('textbox');
  // Trigger onChange
  await element.fill(props.htmlProps.value);

  expect(element).toBeAttached();
  expect(element).toHaveValue(props.htmlProps.value);

  expect(await getHeight($.page())).toBe(36);

  const valueWithLineBreaks =
    'New text\nNew line\nNew text\nNew line\nNew line\nNew line\nNew line\nNew text\nNew line\nNew text\nNew line\nNew line';

  await $.update(
    <TestApp>
      <Input {...props} htmlProps={{ value: valueWithLineBreaks }} />
    </TestApp>,
  );
  // Trigger onChange
  await element.fill(valueWithLineBreaks);

  expect(await getHeight($.page())).toBe(200);

  const shorterValueWithLineBreaks = valueWithLineBreaks.slice(0, 30);

  await $.update(
    <TestApp>
      <Input {...props} htmlProps={{ value: shorterValueWithLineBreaks }} />
    </TestApp>,
  );
  // Trigger onChange
  await element.fill(shorterValueWithLineBreaks);

  expect(await getHeight($.page())).toBeLessThan(200);
});
