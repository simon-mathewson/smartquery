import { expect, test } from '@playwright/experimental-ct-react';
import type { CodeInputProps } from './CodeInput';
import { CodeInput } from './CodeInput';
import { spy } from 'tinyspy';

test('CodeInput', async ({ mount }) => {
  const onChange = spy();
  const onClick = spy();

  const props = {
    language: 'sql',
    onChange,
    editorProps: {
      autoFocus: true,
      onClick,
      placeholder: 'Type your query here',
      value: 'SELECT * FROM TABLE;',
    },
  } satisfies CodeInputProps;

  const $ = await mount(<CodeInput {...props} />);

  const content = $.locator('.cm-content');

  await expect(content).toBeFocused();
  await expect(content).toContainText('SELECT * FROM TABLE;');

  await content.clear();
  expect(onChange.calls.at(-1)?.[0]).toBe('');

  await content.click();
  expect(onClick.calls).toHaveLength(1);

  await $.update(<CodeInput {...props} editorProps={{ ...props.editorProps, value: '' }} />);

  await expect(content).toContainText('Type your query here');

  await $.update(<CodeInput {...props} editorProps={{ ...props.editorProps, readOnly: true }} />);

  onChange.reset();

  await content.fill('test');

  expect(onChange.calls).toHaveLength(0);
});
