import { expect, test } from '@playwright/experimental-ct-react';
import { CodeInput } from './CodeInput';
import { spy } from 'tinyspy';

test('CodeInput', async ({ mount }) => {
  const onChange = spy();
  const onClick = spy();

  const props = {
    autoFocus: true,
    language: 'sql',
    onChange,
    onClick,
    placeholder: 'Type your query here',
    value: 'SELECT * FROM TABLE;',
  } as const;

  const $ = await mount(<CodeInput {...props} />);

  const content = $.locator('.cm-content');

  await expect(content).toBeFocused();
  await expect(content).toContainText('SELECT * FROM TABLE;');

  await content.clear();
  expect(onChange.calls.at(-1)?.[0]).toBe('');

  await content.click();
  expect(onClick.calls).toHaveLength(1);

  await $.update(<CodeInput {...props} value="" />);

  await expect(content).toContainText('Type your query here');

  await $.update(<CodeInput {...props} readOnly />);

  onChange.reset();

  await content.fill('test');

  expect(onChange.calls).toHaveLength(0);
});
