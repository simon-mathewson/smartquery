import { expect, test } from '@playwright/experimental-ct-react';
import type { CodeInputProps } from './CodeInput';
import { CodeInput } from './CodeInput';
import { spy } from 'tinyspy';

test('CodeInput', async ({ mount }) => {
  const onChange = spy();

  const props = {
    language: 'sql',
    onChange,
    editorProps: {
      autoFocus: true,
      placeholder: 'Type your query here',
      value: 'SELECT * FROM TABLE;',
    },
  } satisfies CodeInputProps;

  const $ = await mount(<CodeInput {...props} />);

  const content = $.getByRole('textbox');

  await expect(content).toBeFocused();
  await expect(content).toHaveValue('SELECT * FROM TABLE;');

  await content.clear();
  expect(onChange.calls.at(-1)?.[0]).toBe('');

  await $.update(<CodeInput {...props} editorProps={{ ...props.editorProps, readOnly: true }} />);

  onChange.reset();

  await content.fill('test');

  expect(onChange.calls).toHaveLength(0);
});
