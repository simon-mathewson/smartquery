import { expect, test } from '@playwright/experimental-ct-react';
import type { ColumnFieldProps } from './ColumnField';
import { ColumnField } from './ColumnField';
import type { Column } from '~/shared/types';
import { spy } from 'tinyspy';

test.describe('ColumnField', () => {
  test.describe('Alphanumeric', () => {
    const baseColumn = {
      dataType: 'varchar',
      isVisible: true,
      name: 'alphanumeric_column',
    } satisfies Column;

    const dataTypes = ['datetime', 'int', 'time', 'varchar'] as const;

    const getValue = (dataType: (typeof dataTypes)[number]) =>
      ({
        datetime: '2024-06-14T17:30',
        int: '123',
        time: '10:13',
        varchar: 'Initial value\nwith newline',
      })[dataType];

    const getScenarios = (dataType: (typeof dataTypes)[number]) =>
      [
        {
          column: { ...baseColumn, dataType, isNullable: false },
          value: getValue(dataType),
        },
        {
          column: { ...baseColumn, dataType, isNullable: true },
          value: getValue(dataType),
        },
        {
          column: { ...baseColumn, dataType, isNullable: true },
          value: null,
        },
      ] satisfies Partial<ColumnFieldProps>[];

    const scenarios = {
      datetime: getScenarios('datetime'),
      int: getScenarios('int'),
      time: getScenarios('time'),
      varchar: getScenarios('varchar'),
    };

    dataTypes.forEach((dataType) => {
      test.describe(dataType, () => {
        scenarios[dataType].forEach((scenario) => {
          const { column, value } = scenario;

          test(`${
            column.isNullable
              ? `nullable with initial value ${value === null ? 'null' : 'non-null'}`
              : 'non-nullable'
          }`, async ({ mount }) => {
            const onChange = spy();

            const $ = await mount(<ColumnField {...scenario} onChange={onChange} />);

            const inputRole = column.dataType === 'int' ? 'spinbutton' : 'textbox';
            const input = $.getByRole(inputRole, { name: column.name });
            const nullButton = $.getByRole('radiogroup').getByRole('radio', { name: 'NULL' });

            const tagName = await input.evaluate((node) => node.tagName);
            if (column.dataType === 'varchar') {
              expect(tagName).toBe('TEXTAREA');
            } else {
              expect(tagName).toBe('INPUT');

              if (column.dataType === 'datetime') {
                await expect(input).toHaveAttribute('type', 'datetime-local');
              } else if (column.dataType === 'time') {
                await expect(input).toHaveAttribute('type', 'time');
              } else {
                await expect(input).toHaveAttribute('type', 'number');
              }
            }

            await expect(input).toHaveAttribute('aria-label', column.name);
            await expect($.getByText(column.name)).toBeVisible();

            if (value === null) {
              await expect(input).toHaveValue('');
              await expect(nullButton).toBeChecked();

              const newValue = getValue(column.dataType);
              await input.clear();
              await input.fill(newValue);

              expect(onChange.calls.at(-1)?.[0]).toBe(newValue);
            } else {
              await expect(input).toHaveValue(value);

              if (column.isNullable) {
                await expect(nullButton).not.toBeChecked();

                await nullButton.click();
                expect(onChange.calls.at(-1)?.[0]).toBe(null);
              } else {
                await expect(nullButton).not.toBeAttached();

                await input.clear();
                expect(onChange.calls.at(-1)?.[0]).toBe('');
              }
            }
          });
        });
      });
    });
  });
});
