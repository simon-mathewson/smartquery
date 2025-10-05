import { expect, test } from '@playwright/experimental-ct-react';
import { SqlEditor, type SqlEditorProps } from './SqlEditor';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test.use({ viewport: { width: 600, height: 400 } });

test.describe('SqlEditor', () => {
  const props = {
    onChange: spy(),
    onSubmit: spy(),
    value: 'SELECT * FROM "table" WHERE column = 1',
  } satisfies SqlEditorProps;

  test.beforeEach(() => {
    props.onChange.reset();
    props.onSubmit.reset();
  });

  test('should display SQL', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <SqlEditor {...props} />
      </TestApp>,
    );

    await expect($.page()).toHaveScreenshot('sqlEditor.png');
  });

  test('should allow changing value', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <SqlEditor {...props} />
      </TestApp>,
    );

    expect(await $.evaluate((node) => node.tagName)).toBe('FORM');

    const editor = $.getByRole('textbox');

    const newValue = 'SELECT * FROM "table" WHERE column = 2';
    await editor.clear();
    await editor.fill(newValue);

    expect(props.onChange.calls.slice(-1)[0]).toEqual([newValue]);
  });

  test('should display submit button', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <SqlEditor {...props} />
      </TestApp>,
    );

    const submitButton = $.getByRole('button').last();

    await expect(submitButton).toHaveText('Submit');
    await expect(submitButton).toHaveAttribute('type', 'submit');
    await expect(submitButton).not.toHaveAttribute('disabled');

    await submitButton.click();

    expect(props.onSubmit.calls).toEqual([[]]);
  });

  test('disables submitting if editor is empty', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <SqlEditor {...props} value="" />
      </TestApp>,
    );

    const submitButton = $.getByRole('button').last();

    await expect(submitButton).toHaveAttribute('disabled');

    await submitButton.click({ force: true });

    await $.getByRole('textbox').press('Control+Enter');

    expect(props.onSubmit.calls).toEqual([]);
  });

  test.describe('on non-Windows', () => {
    test.use({ userAgent: 'A quality operating system' });

    test('should allow submitting via CMD+Enter', async ({ mount }) => {
      const $ = await mount(
        <TestApp>
          <SqlEditor {...props} />
        </TestApp>,
      );

      const editor = $.getByRole('textbox');

      await editor.press('Meta+Enter');

      expect(props.onSubmit.calls).toEqual([[]]);
    });
  });

  test.describe('on Windows', () => {
    test.use({ userAgent: 'Windows' });

    test('should allow submitting via CTRL+Enter', async ({ mount }) => {
      const $ = await mount(
        <TestApp>
          <SqlEditor {...props} />
        </TestApp>,
      );

      const editor = $.getByRole('textbox');

      await editor.press('Control+Enter');

      expect(props.onSubmit.calls).toEqual([[]]);
    });
  });
});
