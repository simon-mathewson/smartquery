import { CodeEditor } from './CodeEditor';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';

test('renders code editor with value and allows editing', async ({ mount }) => {
  const value = 'SELECT * FROM table;';
  const onChange = spy();

  const $ = await mount(<CodeEditor onChange={onChange} value={value} />);

  const editor = $.getByRole('textbox');
  await expect(editor).toHaveText(value);

  await editor.click();

  const newValue = 'SELECT column FROM table;\nSELECT 1;';
  await editor.selectText();
  await editor.press('Delete');
  await editor.fill(newValue);

  expect(onChange.calls.at(-1)?.[0]).toBe(newValue);

  const lineNumbers = $.locator('.cm-gutterElement');
  await expect(lineNumbers).toHaveCount(3);
  await expect(lineNumbers.nth(1)).toHaveText('1');
  await expect(lineNumbers.nth(2)).toHaveText('2');
});

test('renders code editor with placeholder', async ({ mount }) => {
  const placeholder = 'Type your query here';
  const onChange = spy();

  const $ = await mount(<CodeEditor onChange={onChange} placeholder={placeholder} value="" />);

  const editor = $.getByRole('textbox');

  await expect(editor).toHaveText(placeholder);

  await editor.fill('a');

  await expect(editor).toHaveText('a');
});

test('renders code editor with line numbers hidden', async ({ mount }) => {
  const $ = await mount(<CodeEditor hideLineNumbers value="test" />);

  const lineNumbers = $.locator('.cm-gutterElement');

  expect(lineNumbers).toHaveCount(0);
});
