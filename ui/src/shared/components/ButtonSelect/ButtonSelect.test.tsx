import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '~/test/render';
import { ButtonSelect } from './ButtonSelect';

describe('ButtonSelect', () => {
  test('allows selecting option', async () => {
    const options = [
      { button: { label: 'Option 1' }, value: '1' },
      { button: { label: 'Option 2' }, value: '2' },
      { button: { label: 'Option 3' }, value: '3' },
    ];
    const onChange = vi.fn();
    const selectedValue = '2';

    render(
      <ButtonSelect
        onChange={onChange}
        options={options}
        selectedButton={{ color: 'primary' }}
        value={selectedValue}
      />,
    );

    const buttons = within(screen.getByRole('radiogroup')).getAllByRole('radio');

    expect(buttons).toHaveLength(3);

    expect(buttons[0]).toHaveAttribute('aria-checked', 'false');
    expect(buttons[1]).toHaveAttribute('aria-checked', 'true');
    expect(buttons[2]).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith(options[0].value);

    await userEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith(undefined);

    await userEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(options[2].value);
  });

  test('requires selection', async () => {
    const options = [
      { button: { label: 'Option 1' }, value: '1' },
      { button: { label: 'Option 2' }, value: '2' },
      { button: { label: 'Option 3' }, value: '3' },
    ];
    const onChange = vi.fn();
    const selectedValue = '2';

    render(
      <ButtonSelect
        onChange={onChange}
        options={options}
        required
        selectedButton={{ color: 'primary' }}
        value={selectedValue}
      />,
    );

    const buttons = within(screen.getByRole('radiogroup')).getAllByRole('radio');

    for (const [index, button] of buttons.entries()) {
      await userEvent.click(button);
      expect(onChange).toHaveBeenCalledWith(options[index].value);
    }
  });
});
