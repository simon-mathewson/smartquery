import { expect, test } from '@playwright/experimental-ct-react';
import { spy } from 'tinyspy';
import { ColumnField } from './ColumnField';
import { assert } from 'ts-essentials';
import { TestApp } from '~/test/componentTests/TestApp';

const dataTypes = ['boolean', 'enum', 'varchar'] as const;

const enumValues = ['foo', 'bar', 'baz'];

const getProps = (dataType: (typeof dataTypes)[number]) =>
  (
    ({
      boolean: {
        column: {
          dataType: 'boolean',
          isNullable: false,
          name: 'boolean_column',
          originalName: 'boolean_column',
        },
        dataType: 'boolean',
        value: 'true',
      },
      enum: {
        column: {
          dataType: 'enum',
          enumValues,
          isNullable: false,
          name: 'enum_column',
          originalName: 'enum_column',
        },
        value: 'foo',
      },
      varchar: {
        column: {
          dataType: 'varchar',
          isNullable: false,
          name: 'varchar_column',
          originalName: 'varchar_column',
        },
        value: 'Initial value\nwith newline',
      },
    }) as const
  )[dataType];

const getScenarios = (dataType: (typeof dataTypes)[number]) => {
  const props = getProps(dataType);

  return [
    props,
    { ...props, column: { ...props.column, isNullable: true } },
    {
      ...props,
      column: { ...props.column, isNullable: true },
      value: null,
    },
  ];
};

dataTypes.forEach((dataType) => {
  const scenarios = getScenarios(dataType);

  test.describe(dataType, () => {
    scenarios.forEach((scenario) => {
      const { column, value } = scenario;

      test(`${
        column.isNullable
          ? `nullable with initial value ${value === null ? 'null' : 'non-null'}`
          : 'non-nullable'
      }`, async ({ mount }) => {
        const onChange = spy();

        const props = {
          ...scenario,
          column: { ...scenario.column, isVisible: true, foreignKey: null },
          onChange,
        };

        const $ = await mount(
          <TestApp>
            <ColumnField {...props} />
          </TestApp>,
        );

        await expect($).toHaveScreenshot(
          `columnField-${dataType}-${column.isNullable ? 'nullable' : 'nonNullable'}-${
            value === null ? 'null' : 'nonNull'
          }.png`,
        );

        const control = {
          boolean: $.getByRole('radiogroup').first(),
          enum: $.getByRole('button'),
          varchar: $.getByRole('textbox'),
        }[dataType];
        const nullButton = $.getByRole('radiogroup').getByRole('radio', { name: 'NULL' });

        assert(control);

        await expect($.getByText(column.name)).toBeVisible();

        if (value === null) {
          if (dataType === 'boolean') {
            await expect(control.getByRole('radio', { checked: true })).not.toBeAttached();
          } else if (dataType === 'enum') {
            await expect(control).toHaveText('Select');
          } else {
            await expect(control).toHaveValue('');
          }

          await expect(nullButton).toBeChecked();

          if (dataType === 'boolean') {
            await control.getByRole('radio').first().click();
          } else if (dataType === 'enum') {
            await control.click();
            await $.page().getByRole('option').first().click();
          } else {
            await control.fill('test');
          }

          expect(onChange.calls.at(-1)?.[0]).not.toBe(null);
        } else {
          if (dataType === 'boolean') {
            await expect(control.getByRole('radio', { checked: true })).toBeAttached();
          } else if (dataType === 'enum') {
            await expect(control).not.toHaveText('Select');
          } else {
            await expect(control).not.toHaveValue('');
          }

          if (!column.isNullable) {
            await expect(nullButton).not.toBeAttached();
            return;
          }

          await expect(nullButton).not.toBeChecked();

          // Control should retain value after null was selected
          await $.update(
            <TestApp>
              <ColumnField {...props} value={null} />
            </TestApp>,
          );

          if (dataType === 'boolean') {
            await expect(control.getByRole('radio', { checked: true })).not.toBeAttached();
          } else if (dataType === 'enum') {
            await expect(control).not.toHaveText('Select');
          } else {
            await expect(control).not.toHaveValue('');
          }

          await expect(nullButton).toBeChecked();
        }
      });
    });
  });
});
