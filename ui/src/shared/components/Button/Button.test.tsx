import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Add, Edit } from '@mui/icons-material';
import { render } from '~/test/render';

describe('Button', () => {
  test('renders button with label', async () => {
    const label = 'Click me';
    const onClick = vi.fn();

    render(<Button label={label} onClick={onClick} />);

    const button = screen.getByRole('button', { name: label });

    expect(button).toHaveTextContent(label);
    expect(button).toHaveStyle({
      cursor: 'pointer',
      height: '36px',
    });

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test('renders button with icon', async () => {
    const icon = <Add />;
    const onClick = vi.fn();

    render(<Button icon={icon} onClick={onClick} />);

    const button = screen.getByRole('button');

    expect(button.textContent).toBe('');
    expect(button).toHaveStyle({ height: '36px' });
    within(button).getByTestId('AddIcon');

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test('renders small disabled link with icon, long label, and suffix', async () => {
    const icon = <Add />;
    const label = 'Click this button even though it is disabled';
    const textSuffix = 'Suffix';
    const onClick = vi.fn();

    render(
      <Button
        className="w-100"
        disabled
        element="a"
        href="#"
        icon={icon}
        label={label}
        onClick={onClick}
        suffix={<Edit />}
        textSuffix={textSuffix}
      />,
    );

    const button = screen.getByRole('link', { name: label });

    expect(button).toHaveTextContent(label + textSuffix);
    expect(button).toHaveAttribute('href', '#');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    within(button).getByTestId('AddIcon');
  });
});
