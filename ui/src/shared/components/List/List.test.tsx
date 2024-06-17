import { render, screen } from '@testing-library/react';
import { List } from './List';

describe('List', () => {
  test('should render empty placeholder when no items are provided', () => {
    const placeholder = 'No items';

    render(<List emptyPlaceholder={placeholder} items={[]} />);

    expect(screen.getByText(placeholder)).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  test('should render basic list', () => {
    const labels = ['Item 1', 'Item 2', 'Item 3'];
    const items = labels.map((label) => ({ label }));

    render(<List items={items} />);

    expect(screen.queryByText('No items')).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(labels.length);
  });
});
