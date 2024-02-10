import React, { useMemo } from 'react';
import { EditContext } from '~/content/edit/Context';
import { PrimaryKey } from '~/content/edit/types';
import { Column, Query, Value } from '~/content/queries/types';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Field } from '~/shared/components/Field/Field';
import { Input } from '~/shared/components/Input/Input';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';

export type ColumnFieldProps = {
  autoFocus?: boolean;
  column: Column;
  query: Query;
  rows: Array<{ primaryKeys: PrimaryKey[]; value: Value }>;
};

export const ColumnField: React.FC<ColumnFieldProps> = (props) => {
  const { autoFocus, column, query, rows } = props;

  const { getChangedValue, handleChange } = useDefinedContext(EditContext);

  const { isNull, locations, textValue } = useMemo(() => {
    const locations = rows.map((row) => ({
      column: column.name,
      row,
      table: query.table!,
    }));

    const values = locations.map((location) => {
      const changedValue = getChangedValue(location);
      return changedValue === undefined ? location.row.value : changedValue;
    });
    const allValuesAreEqual = values.every((value) => value === values[0]);
    const firstValue = values[0];
    const firstValueOriginalValue = locations[0].row.value;
    const firstValueOriginalValueText = firstValueOriginalValue
      ? String(firstValueOriginalValue)
      : '';
    const firstValueText = firstValue ? String(firstValue) : firstValueOriginalValueText;

    return {
      isNull: allValuesAreEqual && firstValue === null,
      locations,
      textValue: allValuesAreEqual ? firstValueText : undefined,
    };
  }, [column.name, getChangedValue, query.table, rows]);

  return (
    <Field label={column.name}>
      <Input
        autoFocus={autoFocus}
        key={column.name}
        onChange={(newValue) =>
          locations.forEach((location) => handleChange({ location, value: newValue }))
        }
        placeholder={textValue === undefined ? 'Multiple values' : undefined}
        value={textValue ?? ''}
      />
      {column.isNullable && (
        <ButtonSelect
          onChange={(newValue) => {
            locations.forEach((location) =>
              handleChange({ location, value: newValue === null ? null : textValue ?? '' }),
            );
          }}
          options={[{ label: 'NULL', value: null }]}
          value={isNull ? null : undefined}
        />
      )}
    </Field>
  );
};
