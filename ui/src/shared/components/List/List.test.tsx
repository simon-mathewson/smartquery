import { render, screen, waitFor, within } from '@testing-library/react';
import { List } from './List';
import type { ListItemProps } from './Item';
import { Add } from '@mui/icons-material';
import userEvent from '@testing-library/user-event';

describe('List', () => {
  test('should render empty placeholder when no items are provided', () => {
    const placeholder = 'No items';

    render(<List emptyPlaceholder={placeholder} items={[]} />);

    screen.getByText(placeholder);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  test('should render basic list and allow selecting items', async () => {
    const labels = ['Item 1', 'Item 2', 'Item 3'];
    const items = labels.map((label) => ({ label, onSelect: vi.fn() }));

    render(<List items={items} />);

    expect(screen.queryByText('No items')).not.toBeInTheDocument();

    const renderedItems = screen.queryAllByRole('option');

    expect(renderedItems).toHaveLength(labels.length);

    renderedItems.forEach((item, index) => {
      expect(item).toHaveTextContent(labels[index]);
      expect(item).not.toHaveAttribute('aria-selected');
    });

    userEvent.click(renderedItems[0]);

    await waitFor(() => expect(items[0].onSelect).toHaveBeenCalled());
    expect(items[1].onSelect).not.toHaveBeenCalled();
    expect(items[2].onSelect).not.toHaveBeenCalled();

    const itemsWithSelected = items.map((item, index) => ({
      ...item,
      selected: index === 0,
    })) satisfies ListItemProps[];

    render(<List items={itemsWithSelected} />);

    screen.getByRole('option', { selected: true });

    expect(screen.getAllByRole('option', { selected: false })).toHaveLength(2);
  });

  test('should render list with item actions and hints', async () => {
    const items = [
      {
        actions: [{ icon: <Add />, onClick: vi.fn() }],
        hint: 'Hint 1',
        label: 'Item 1',
      },
      {
        actions: [{ icon: <Add />, onClick: vi.fn() }],
        hint: 'Hint 2',
        label: 'Item 2',
      },
    ] satisfies ListItemProps[];

    render(<List items={items} />);

    expect(screen.queryByText('No items')).not.toBeInTheDocument();

    const renderedItems = screen.getAllByRole('option');

    expect(renderedItems).toHaveLength(items.length);

    await Promise.all(
      renderedItems.map(async (item, index) => {
        expect(item).toHaveTextContent(items[index].label);
        expect(item).toHaveTextContent(items[index].hint);

        within(item).getByTestId('AddIcon');
        userEvent.click(within(item).getByRole('button'));

        await waitFor(() => expect(items[index].actions[0].onClick).toHaveBeenCalled());
      }),
    );
  });
});
