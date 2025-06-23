import { ButtonSelect } from './ButtonSelect';
import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { TestApp } from '~/test/componentTests/TestApp';

test('renders', async ({ mount }) => {
  const $ = await mount(
    <TestApp>
      <ButtonSelect
        options={[
          { button: { label: 'Option 1' }, value: '1' },
          { button: { label: 'Option 2' }, value: '2' },
          { button: { label: 'Option 3' }, value: '3' },
        ]}
        onChange={() => {}}
        value="1"
      />
    </TestApp>,
  );

  await expect($).toHaveScreenshot('buttonSelect.png');
});

test('allows selecting option', async ({ mount }) => {
  const options = [
    { button: { label: 'Option 1' }, value: '1' },
    { button: { label: 'Option 2' }, value: '2' },
    { button: { label: 'Option 3' }, value: '3' },
  ];
  const onChange = spy();
  const selectedValue = '2';

  const $ = await mount(
    <TestApp>
      <ButtonSelect
        onChange={onChange}
        options={options}
        selectedButton={{ color: 'primary' }}
        value={selectedValue}
      />
    </TestApp>,
  );

  await expect($).toHaveRole('radiogroup');

  const buttons = $.getByRole('radio');

  await expect(buttons).toHaveCount(3);

  await expect(buttons.nth(0)).toHaveAttribute('aria-checked', 'false');
  await expect(buttons.nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(buttons.nth(2)).toHaveAttribute('aria-checked', 'false');

  await buttons.nth(0).click();
  expect(onChange.callCount).toBe(1);
  expect(onChange.calls[0][0]).toEqual(options[0].value);

  await buttons.nth(1).click();
  expect(onChange.callCount).toBe(2);
  expect(onChange.calls[1][0]).toEqual(undefined);

  await buttons.nth(2).click();
  expect(onChange.callCount).toBe(3);
  expect(onChange.calls[2][0]).toEqual(options[2].value);
});

test('requires selection', async ({ mount }) => {
  const options = [
    { button: { label: 'Option 1' }, value: '1' },
    { button: { label: 'Option 2' }, value: '2' },
    { button: { label: 'Option 3' }, value: '3' },
  ];
  const onChange = spy();
  const selectedValue = '2';

  const $ = await mount(
    <TestApp>
      <ButtonSelect
        onChange={onChange}
        options={options}
        required
        selectedButton={{ color: 'primary' }}
        value={selectedValue}
      />
    </TestApp>,
  );

  const buttons = await $.getByRole('radio').all();

  for (const [index, button] of buttons.entries()) {
    await button.click();
    expect(onChange.calls[index][0]).toBe(options[index].value);
  }
});
