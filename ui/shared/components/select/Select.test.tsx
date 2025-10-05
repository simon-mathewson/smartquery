import { expect, test } from '@playwright/experimental-ct-react';
import { Select } from './Select';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test.describe('Select', () => {
  const onChange = spy();

  const options = [
    { label: 'The first item in the select list', value: 'option1' },
    { label: 'Two', value: 'option2' },
    { label: 'Three', value: 'option3' },
  ];

  const placeholder = 'Select an option';

  const props = {
    htmlProps: { className: '!w-80' },
    placeholder,
    options,
    value: null,
    onChange,
  };

  test.beforeEach(() => {
    onChange.reset();
  });

  test('should render empty select with placeholder', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Select {...props} />
      </TestApp>,
    );

    await expect($).toHaveScreenshot('triggerEmpty.png');

    await expect($).toHaveRole('button');

    await expect($).toHaveAccessibleName(placeholder);
    await expect($).toHaveText(placeholder);
    await expect($).toHaveAttribute('aria-expanded', 'false');
    await expect($).toHaveAttribute('aria-haspopup', 'listbox');
    await expect($).toHaveAttribute('aria-controls', expect.any(String));
  });

  test('allows opening dropdown and selecting value', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Select {...props} />
      </TestApp>,
    );

    await $.hover();
    await expect($).toHaveScreenshot('triggerHover.png');

    await $.click();

    const listboxId = (await $.getAttribute('aria-controls')) as string;
    const listbox = $.page().getByRole('listbox');

    await expect($).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox).toHaveAttribute('id', listboxId);
    await expect(listbox).toHaveScreenshot('options.png');

    const optionEls = listbox.getByRole('option');
    await expect(optionEls).toHaveCount(3);

    await optionEls.first().hover();
    await expect(listbox).toHaveScreenshot('optionHover.png');

    await optionEls.first().click();

    expect(onChange.calls).toEqual([[options[0].value]]);
  });

  test('should render select with selected value', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Select {...props} value={options[0].value} />
      </TestApp>,
    );

    await expect($).toHaveText(options[0].label);
    await expect($).toHaveAttribute('data-value', options[0].value);
    await expect($).not.toHaveText(placeholder);
    await expect($).toHaveScreenshot('triggerFilled.png');

    await $.click();

    const listbox = $.page().getByRole('listbox');
    const optionEls = listbox.getByRole('option');

    await expect(optionEls.first()).toHaveAttribute('aria-selected', 'true');
    await expect(optionEls.last()).toHaveAttribute('aria-selected', 'false');
    await expect(listbox).toHaveScreenshot('optionSelected.png');
  });

  test('should render select with disabled state', async ({ mount }) => {
    const $ = await mount(
      <TestApp>
        <Select {...props} htmlProps={{ ...props.htmlProps, disabled: true }} />
      </TestApp>,
    );

    await expect($).toHaveScreenshot('triggerDisabled.png');

    await expect($).toBeDisabled();
  });
});
