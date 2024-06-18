import { screen, waitFor, within } from '@testing-library/react';
import { render } from '~/test/render';
import { List } from './List';
import type { ListItemProps } from './Item';
import { Add } from '@mui/icons-material';
import userEvent from '@testing-library/user-event';

describe('List', () => {
  const emptyPlaceholder = 'No items';

  test('renders empty placeholder when no items are provided', () => {
    render(<List emptyPlaceholder={emptyPlaceholder} items={[]} />);

    screen.getByText(emptyPlaceholder);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  test('renders basic list and allow selecting items', async () => {
    const labels = ['Item 1', 'Item 2', 'Item 3'];
    const items = labels.map((label) => ({ label, onSelect: vi.fn() }));

    render(<List emptyPlaceholder={emptyPlaceholder} items={items} />);

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

    render(<List emptyPlaceholder={emptyPlaceholder} items={itemsWithSelected} />);

    screen.getByRole('option', { selected: true });

    expect(screen.getAllByRole('option', { selected: false })).toHaveLength(2);
  });

  test('renders list with item actions and hints', async () => {
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

    render(<List emptyPlaceholder={emptyPlaceholder} items={items} />);

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

  describe('allows navigating via keyboard', async () => {
    const items = [
      { label: 'Some item', onSelect: vi.fn() },
      { label: 'another', onSelect: vi.fn() },
      { label: '5 guys', onSelect: vi.fn() },
    ] satisfies ListItemProps[];

    beforeEach(() => {
      render(<List emptyPlaceholder={emptyPlaceholder} items={items} />);

      screen.getByRole('listbox').focus();
    });

    test('up', async () => {
      screen.getAllByRole('option')[2].focus();

      userEvent.keyboard('{arrowup}');
      await waitFor(() => expect(screen.getAllByRole('option')[1]).toHaveFocus());

      userEvent.keyboard('{Shift>}{Tab}');
      await waitFor(() => expect(screen.getAllByRole('option')[0]).toHaveFocus());
    });

    test('down', async () => {
      userEvent.keyboard('{arrowdown}');
      await waitFor(() => expect(screen.getAllByRole('option')[0]).toHaveFocus());

      userEvent.keyboard('{Tab}');
      await waitFor(() => expect(screen.getAllByRole('option')[1]).toHaveFocus());
    });

    test('first', async () => {
      screen.getAllByRole('option')[2].focus();

      userEvent.keyboard('{Home}');
      await waitFor(() => expect(screen.getAllByRole('option')[0]).toHaveFocus());
    });

    test('last', async () => {
      userEvent.keyboard('{End}');
      await waitFor(() => expect(screen.getAllByRole('option')[2]).toHaveFocus());
    });

    test('select', async () => {
      screen.getAllByRole('option')[1].focus();
      userEvent.keyboard('{Enter}');
      await waitFor(() => expect(items[1].onSelect).toHaveBeenCalled());

      screen.getAllByRole('option')[2].focus();
      userEvent.keyboard(' ');
      await waitFor(() => expect(items[2].onSelect).toHaveBeenCalled());
    });

    test('blur', async () => {
      userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.getByRole('listbox')).not.toHaveFocus());
    });

    test('focus item by first character', async () => {
      for (const item of items) {
        userEvent.keyboard(item.label[0].toLowerCase());
        await waitFor(() => expect(screen.getByRole('option', { name: item.label })).toHaveFocus());
      }
    });
  });
});
