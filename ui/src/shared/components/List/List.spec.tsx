import { expect, test } from '@playwright/experimental-ct-react';
import { List } from './List';
import { spy } from 'tinyspy';
import { Add } from '@mui/icons-material';
import type { ListItemProps } from './Item';

test.use({ viewport: { width: 500, height: 500 } });

test.describe('List', () => {
  const emptyPlaceholder = 'No items';

  test('renders empty placeholder when no items are provided', async ({ mount }) => {
    const component = await mount(<List emptyPlaceholder={emptyPlaceholder} items={[]} />);

    await expect(component).toContainText(emptyPlaceholder);
    await expect(component.getByRole('option')).toHaveCount(0);
  });

  test('renders basic list and allow selecting items', async ({ mount }) => {
    const labels = ['Item 1', 'Item 2', 'Item 3'];
    const items = labels.map((label) => ({ label, onSelect: spy() }));

    const component = await mount(<List emptyPlaceholder={emptyPlaceholder} items={items} />);

    await expect(component).toHaveRole('listbox');
    await expect(component).not.toContainText('No items');

    const renderedItems = component.getByRole('option');

    await expect(renderedItems).toHaveCount(labels.length);

    for (const [index, item] of (await renderedItems.all()).entries()) {
      await expect(item).toContainText(labels[index]);
      await expect(item).not.toHaveAttribute('aria-selected');
    }

    await renderedItems.first().click();

    expect(items[0].onSelect.callCount).toBe(1);
    expect(items[1].onSelect.callCount).toBe(0);
    expect(items[2].onSelect.callCount).toBe(0);

    const itemsWithSelected = items.map((item, index) => ({
      ...item,
      selected: index === 0,
    }));

    await component.unmount();

    const componentWithSelected = await mount(
      <List emptyPlaceholder={emptyPlaceholder} items={itemsWithSelected} />,
    );

    await expect(componentWithSelected.getByRole('option', { selected: true })).toHaveCount(1);
    await expect(componentWithSelected.getByRole('option', { selected: false })).toHaveCount(2);
  });

  test('renders list with item actions and hints', async ({ mount }) => {
    const items = [
      {
        actions: [{ icon: <Add />, onClick: spy() }],
        hint: 'Hint 1',
        label: 'Item 1',
      },
      {
        actions: [{ icon: <Add />, onClick: spy() }],
        hint: 'Hint 2',
        label: 'Item 2',
      },
    ];

    const component = await mount(<List items={items} />);

    for (const [index, item] of (await component.getByRole('option').all()).entries()) {
      await expect(item).toContainText(items[index].label);
      await expect(item).toContainText(items[index].hint);
      await expect(item.getByTestId('AddIcon')).toBeAttached();

      await item.getByRole('button').click();

      expect(items[index].actions[0].onClick.callCount).toBe(1);
    }
  });

  test.describe('allows navigating via keyboard', () => {
    const items = [
      { label: 'Some item', onSelect: spy() },
      { label: 'another', onSelect: spy() },
      { label: '5 guys', onSelect: spy() },
    ] satisfies ListItemProps[];

    test.afterEach(() => {
      for (const item of items) {
        item.onSelect.reset();
      }
    });

    test('up', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.getByRole('option').nth(2).press('ArrowUp');
      await expect(component.getByRole('option').nth(1)).toBeFocused();

      await component.getByRole('option').nth(1).press('Shift+Tab');
      await expect(component.getByRole('option').nth(0)).toBeFocused();
    });

    test('down', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.getByRole('option').nth(0).press('ArrowDown');
      await expect(component.getByRole('option').nth(1)).toBeFocused();

      await component.getByRole('option').nth(1).press('Tab');
      await expect(component.getByRole('option').nth(2)).toBeFocused();
    });

    test('first', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.getByRole('option').nth(2).press('Home');
      await expect(component.getByRole('option').nth(0)).toBeFocused();
    });

    test('last', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.getByRole('option').nth(0).press('End');
      await expect(component.getByRole('option').nth(2)).toBeFocused();
    });

    test('select', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.getByRole('option').nth(1).press('Enter');
      await expect.poll(() => items[1].onSelect.callCount).toBe(1);

      await component.getByRole('option').nth(2).press(' ');
      await expect.poll(() => items[2].onSelect.callCount).toBe(1);
    });

    test('blur', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      await component.press('Escape');
      await expect(component).not.toBeFocused();
    });

    test('focus item by first character', async ({ mount }) => {
      const component = await mount(<List items={items} />);

      for (const item of items) {
        await component.press(item.label[0].toLowerCase());
        await expect(component.getByRole('option', { name: item.label })).toBeFocused();
      }
    });
  });
});
