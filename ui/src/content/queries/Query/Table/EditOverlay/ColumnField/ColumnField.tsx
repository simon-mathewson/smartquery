import React, { useMemo } from 'react';
import { includes } from 'lodash';
import { EditContext } from '~/content/edit/Context';
import { ChangeLocation, PrimaryKey } from '~/content/edit/types';
import { Column, Query, Value } from '~/content/queries/types';
import { Field } from '~/shared/components/Field/Field';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Boolean } from './Boolean/Boolean';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';
import { DateField } from './Date/Date';

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

  return (
    <Field label={column.name}>
      {(() => {
        if (column.dataType === 'boolean') {
          return (
            <Boolean
              multipleValues={multipleValues}
              isNullable={column.isNullable}
              setValue={setValue}
              value={values[0] as boolean | null}
            />
          );
        }
        if (includes(['timestamp', 'timestamp without time zone'], column.dataType)) {
          return (
            <DateField
              autoFocus={autoFocus}
              multipleValues={multipleValues}
              isNullable={column.isNullable}
              setValue={setValue}
              value={values[0] as Date | null}
            />
          );
        }
        return (
          <Alphanumeric
            autoFocus={autoFocus}
            isNullable={column.isNullable}
            locations={locations}
            multipleValues={multipleValues}
            setValue={setValue}
            value={values[0] as string | null}
          />
        );
      })()}
    </Field>
  );
};
