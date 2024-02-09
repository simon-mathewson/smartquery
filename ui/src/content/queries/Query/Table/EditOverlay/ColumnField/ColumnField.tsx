import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { PrimaryKey } from '~/content/edit/types';
import { Column, Query, Value } from '~/content/queries/types';
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

  const locations = rows.map((row) => ({
    column: column.name,
    row,
    table: query.table!,
  }));

  const values = locations.map((location) => getChangedValue(location) ?? location.row.value);
  const allValuesAreEqual = values.every((value) => value === values[0]);
  const valueString = allValuesAreEqual ? String(values[0]) || '' : '';

  return (
    <Input
      autoFocus={autoFocus}
      key={column.name}
      label={column.name}
      placeholder={!allValuesAreEqual ? 'Multiple values' : undefined}
      value={valueString}
      onChange={(newValue) => {
        locations.forEach((location) => handleChange({ location, value: newValue }));
      }}
    />
  );
};
