import { CodeEditor } from './CodeEditor';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test('renders code editor with value and allows editing', async ({ mount }) => {
  const value = 'SELECT * FROM table;';
  const onChange = spy();

  const $ = await mount(
    <TestApp>
      <CodeEditor autoFocus value={value} onChange={onChange} />
    </TestApp>,
  );

  await expect($).toHaveText(`1${value}`);

  await expect($).toHaveScreenshot('codeEditor.png');

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
  const $ = await mount(
    <TestApp>
      <CodeEditor hideLineNumbers value="test" />
    </TestApp>,
  );

  await expect($.locator('.line-numbers')).not.toBeAttached();
});
