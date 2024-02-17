import React, { useMemo } from 'react';
import { EditContext } from '~/content/edit/Context';
import type { ChangeLocation, PrimaryKey } from '~/content/edit/types';
import type { Column, Query, Value } from '~/content/queries/types';
import { Field } from '~/shared/components/Field/Field';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Boolean } from './Boolean/Boolean';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';
import { NullButton } from './Null/Null';
import { isEnumType } from './utils';
import { EnumField } from './EnumField/EnumField';

export type ColumnFieldProps = {
  autoFocus?: boolean;
  column: Column;
  query: Query;
  rows: Array<{ primaryKeys: PrimaryKey[]; value: Value }>;
};

export const ColumnField: React.FC<ColumnFieldProps> = (props) => {
  const { autoFocus, column, query, rows } = props;

  const { getChangedValue, handleChange } = useDefinedContext(EditContext);

  const locations = useMemo(
    () =>
      rows.map(
        (row) =>
          ({
            column: column.name,
            row,
            table: query.table!,
          }) satisfies ChangeLocation,
      ),
    [column.name, query.table, rows],
  );

  const values = useMemo(
    () =>
      locations.map((location) => {
        const changedValue = getChangedValue(location);
        return changedValue === undefined ? location.row.value : changedValue;
      }),
    [getChangedValue, locations],
  );

  const multipleValues = useMemo(() => !values.every((value) => value === values[0]), [values]);

  const setValue = (newValue: Value) => {
    locations.forEach((location) => handleChange({ location, value: newValue }));
  };

  const value = values[0];

  return (
    <Field label={column.name}>
      {(() => {
        if (column.dataType === 'boolean') {
          return (
            <Boolean
              multipleValues={multipleValues}
              isNullable={column.isNullable}
              setValue={setValue}
              value={value as boolean | null}
            />
          );
        }
        if (isEnumType(column.dataType!) && column.enumValues) {
          return (
            <EnumField
              column={column}
              isNullable={column.isNullable}
              multipleValues={multipleValues}
              setValue={setValue}
              value={value as string | null}
            />
          );
        }
        return (
          <Alphanumeric
            autoFocus={autoFocus}
            dataType={column.dataType!}
            locations={locations}
            multipleValues={multipleValues}
            setValue={setValue}
            value={value as string | null}
          />
        );
      })()}
      <NullButton
        isNullable={column.isNullable}
        multipleValues={multipleValues}
        setValue={setValue}
        value={value}
      />
    </Field>
  );
};
