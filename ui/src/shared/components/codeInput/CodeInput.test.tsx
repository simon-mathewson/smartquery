import { expect, test } from '@playwright/experimental-ct-react';
import type { CodeInputProps } from './CodeInput';
import { CodeInput } from './CodeInput';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

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

  const $ = await mount(
    <TestApp>
      <CodeInput {...props} />
    </TestApp>,
  );

  const content = $.getByRole('textbox');

  await expect(content).toBeFocused();
  await expect(content).toHaveValue('SELECT * FROM TABLE;');

  await expect($).toHaveScreenshot('codeInput.png');

  await content.clear();
  expect(onChange.calls.at(-1)?.[0]).toBe('');

  await $.update(
    <TestApp>
      <CodeInput {...props} editorProps={{ ...props.editorProps, readOnly: true }} />
    </TestApp>,
  );

  onChange.reset();

  await content.fill('test');

  expect(onChange.calls).toHaveLength(0);
});
