import { expect, test } from '@playwright/experimental-ct-react';
import { EnumField, type EnumFieldProps } from './EnumField';
import { spy } from 'tinyspy';

test.describe('Enum', () => {
  const onChange = spy();

  const postgresProps = {
    column: {
      dataType: 'enum',
      enumValues: [
        'Strawberry',
        'Banana',
        'Raspberry',
        'Green Watermelon',
        'Blueberry',
        'Pineapple',
        'Blackberry',
        'Apple',
        'Orange',
        'Kiwi',
      ],
      isNullable: true,
      isVisible: true,
      name: 'fruit',
    },
    onChange,
    placeholder: 'Select a fruit',
    stringValue: 'Banana',
  } satisfies EnumFieldProps;

  const mysqlProps = {
    ...postgresProps,
    column: {
      ...postgresProps.column,
      dataType: 'user-defined',
    },
  } satisfies EnumFieldProps;

  const scenarios = {
    postgres: postgresProps,
    mysql: mysqlProps,
  } as const;

  Object.entries(scenarios).forEach(async ([scenario, props]) => {
    test(scenario, async ({ mount }) => {
      const $ = await mount(<EnumField {...props} />);

      await expect($).toHaveAccessibleName('Banana');
      await expect($).toHaveText('Banana');
      await expect($).toHaveAttribute('aria-expanded', 'false');
      await expect($).toHaveAttribute('aria-haspopup', 'listbox');
      await expect($).toHaveAttribute('aria-controls', expect.any(String));

      await $.click();
      await expect($).toHaveAttribute('aria-expanded', 'true');

      const listboxId = (await $.getAttribute('aria-controls')) as string;
      const listbox = $.page().getByRole('listbox');
      await expect(listbox).toHaveAttribute('id', listboxId);
      await expect(listbox.getByRole('option', { selected: true })).toHaveText('Banana');

      await listbox.getByRole('option', { name: 'Strawberry' }).click();

      expect(onChange.calls.at(-1)?.[0]).toBe('Strawberry');

      await $.update(<EnumField {...props} stringValue={null} />);

      await expect($).toHaveText(props.placeholder);
    });
  });
});
