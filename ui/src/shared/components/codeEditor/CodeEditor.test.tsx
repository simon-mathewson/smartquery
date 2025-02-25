import { CodeEditor } from './CodeEditor';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';

test('renders code editor with value and allows editing', async ({ mount }) => {
  const value = 'SELECT * FROM table;';
  const onChange = spy();

  const $ = await mount(<CodeEditor autoFocus value={value} onChange={onChange} />);

  await expect($).toHaveText(`1${value}`);

  await $.click();

  const editor = $.getByRole('textbox');
  const newValue = 'SELECT column FROM table;\nSELECT 1;';
  await editor.selectText();
  await editor.press('Delete');
  await editor.fill(newValue);

  expect(onChange.calls.at(-1)?.[0]).toBe(newValue);

  const lineNumbers = $.locator('.line-numbers');
  await expect(lineNumbers).toHaveCount(2);
  await expect(lineNumbers.nth(0)).toHaveText('1');
  await expect(lineNumbers.nth(1)).toHaveText('2');
});

test('renders code editor with line numbers hidden', async ({ mount }) => {
  const $ = await mount(<CodeEditor hideLineNumbers value="test" />);

  await expect($.locator('.line-numbers')).not.toBeAttached();
});
