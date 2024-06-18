import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Add, Edit } from '@mui/icons-material';

describe('Button', () => {
  test('renders button with label', async () => {
    const label = 'Click me';
    const onClick = vi.fn();

    render(<Button label={label} onClick={onClick} />);

    const button = screen.getByRole('button', { name: label });

    expect(button).toHaveTextContent(label);

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test('renders button with icon', async () => {
    const icon = <Add />;
    const onClick = vi.fn();

    render(<Button icon={icon} onClick={onClick} />);

    const button = screen.getByRole('button');

    expect(button.textContent).toBe('');
    within(button).getByTestId('AddIcon');

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test('renders disabled link with icon, long label, and suffix', async () => {
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

    // await userEvent.click(button);

    // expect(onClick).not.toHaveBeenCalled();
  });
});
