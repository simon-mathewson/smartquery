import { expect, test } from '@playwright/experimental-ct-react';
import { List } from './List';

test.use({ viewport: { width: 500, height: 500 } });

test.describe('List', () => {
  test('should render empty placeholder when no items are provided', async ({ mount }) => {
    const placeholder = 'No items';
    const component = await mount(<List emptyPlaceholder={placeholder} items={[]} />);
    expect(component).toContainText(placeholder);
    expect(component.getByRole('option')).toHaveCount(0);
  });

  test('should render basic list', async ({ mount }) => {
    const labels = ['Item 1', 'Item 2', 'Item 3'];
    const items = labels.map((label) => ({ label }));

    const component = await mount(<List items={items} />);

    expect(component).not.toContainText('No items');
    expect(component.getByRole('option')).toHaveCount(labels.length);
  });
});
