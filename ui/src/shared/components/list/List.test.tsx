import { expect, test } from '@playwright/experimental-ct-react';
import { List } from './List';
import { spy } from 'tinyspy';
import { Add } from '@mui/icons-material';

test.describe('List', () => {
  const emptyPlaceholder = 'No items';

  const items = [
    { label: 'Some item', value: 'item1' },
    { label: 'another', value: 'item2' },
    { label: '5 Guys Burgers And Fries', value: 'item3' },
  ];

  const onSelect = spy();

  const props = {
    emptyPlaceholder,
    items,
    onSelect,
    selectedValue: null,
  };

  test.beforeEach(() => {
    onSelect.reset();
  });

  test('renders empty placeholder when no items are provided', async ({ mount }) => {
    const $ = await mount(
      <List emptyPlaceholder={emptyPlaceholder} items={[]} selectedValue={null} />,
    );

    await expect($).toHaveText(emptyPlaceholder);
    await expect($.getByRole('option')).toHaveCount(0);
  });

  test('renders basic list and allow selecting items', async ({ mount }) => {
    const $ = await mount(<List {...props} />);

    await expect($).toHaveRole('listbox');
    await expect($).not.toContainText('No items');

    const renderedItems = $.getByRole('option');

    await expect(renderedItems).toHaveCount(items.length);

    for (const [index, item] of (await renderedItems.all()).entries()) {
      await expect(item).toHaveText(items[index].label);
      await expect(item).toHaveAttribute('aria-selected', 'false');
    }

    await renderedItems.first().click();

    expect(onSelect.calls).toEqual([[items[0].value]]);

    await $.update(<List {...props} selectedValue={items[0].value} />);

    await expect($.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    await expect($.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'false');
    await expect($.getByRole('option').last()).toHaveAttribute('aria-selected', 'false');
  });

  test('renders list with item actions and hints', async ({ mount }) => {
    const items = [
      {
        actions: [{ icon: <Add />, label: 'Add', onClick: spy() }],
        hint: 'Hint 1',
        label: 'Item 1',
        value: 'item1',
      },
      {
        actions: [{ icon: <Add />, label: 'Add', onClick: spy() }],
        hint: 'Hint 2',
        label: 'Item 2',
        value: 'item2',
      },
    ];

    const $ = await mount(<List items={items} selectedValue={null} />);

    for (const [index, item] of (await $.getByRole('option').all()).entries()) {
      await expect(item).toContainText(items[index].label);
      await expect(item).toContainText(items[index].hint);

      await expect(item.getByRole('button', { name: 'Add' }).getByTestId('AddIcon')).toBeAttached();

      await item.getByRole('button').click();

      expect(items[index].actions[0].onClick.callCount).toBe(1);
    }
  });

  test('should auto focus selected option', async ({ mount }) => {
    const $ = await mount(<List {...props} selectedValue={props.items[1].value} />);

    await $.click();

    const listbox = $.page().getByRole('listbox');
    const optionEls = listbox.getByRole('option');

    await expect(optionEls.nth(1)).toBeFocused();
  });

  test.describe('should allow navigating list via keyboard', () => {
    test('up', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.getByRole('option').nth(2).press('ArrowUp');
      await expect($.getByRole('option').nth(1)).toBeFocused();

      await $.getByRole('option').nth(1).press('Shift+Tab');
      await expect($.getByRole('option').nth(0)).toBeFocused();
    });

    test('down', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.getByRole('option').nth(0).press('ArrowDown');
      await expect($.getByRole('option').nth(1)).toBeFocused();

      await $.getByRole('option').nth(1).press('Tab');
      await expect($.getByRole('option').nth(2)).toBeFocused();
    });

    test('first', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.getByRole('option').nth(2).press('Home');
      await expect($.getByRole('option').nth(0)).toBeFocused();
    });

    test('last', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.getByRole('option').nth(0).press('End');
      await expect($.getByRole('option').nth(2)).toBeFocused();
    });

    test('select', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.getByRole('option').nth(1).press('Enter');
      expect(onSelect.calls).toEqual([[items[1].value]]);

      await $.getByRole('option').nth(2).press(' ');
      expect(onSelect.calls).toEqual([[items[1].value], [items[2].value]]);
    });

    test('blur', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      await $.press('Escape');
      await expect($).not.toBeFocused();
    });

    test('focus item by first character', async ({ mount }) => {
      const $ = await mount(<List {...props} />);

      for (const item of items) {
        await $.press(item.label[0].toLowerCase());
        await expect($.getByRole('option', { name: item.label })).toBeFocused();
      }
    });
  });
});
