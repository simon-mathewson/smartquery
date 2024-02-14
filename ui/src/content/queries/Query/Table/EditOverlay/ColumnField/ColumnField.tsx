import React, { useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { EditContext } from '~/content/edit/Context';
import { PrimaryKey } from '~/content/edit/types';
import { Column, Query, Value } from '~/content/queries/types';
import { Field } from '~/shared/components/Field/Field';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Boolean } from './Boolean/Boolean';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';

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
      rows.map((row) => ({
        column: column.name,
        row,
        table: query.table!,
      })),
    [column.name, query.table, rows],
  );

  const [localTextValue, setLocalTextValue] = useState(() => {
    const firstValueChanged = getChangedValue(locations[0]);

    if (!isNil(firstValueChanged)) return String(firstValueChanged);

    const firstValueOriginalValue = rows[0].value;
    return firstValueOriginalValue ? String(firstValueOriginalValue) : '';
  });

  const { isNull, textValue, value } = useMemo(() => {
    const values = locations.map((location) => {
      const changedValue = getChangedValue(location);
      return changedValue === undefined ? location.row.value : changedValue;
    });
    const allValuesAreEqual = values.every((value) => value === values[0]);
    const firstValue = values[0];
    const firstValueText = isNil(firstValue) ? localTextValue : String(firstValue);

    return {
      isNull: allValuesAreEqual && firstValue === null,
      locations,
      textValue: allValuesAreEqual ? firstValueText : undefined,
      value: allValuesAreEqual ? firstValue : undefined,
    };
  }, [getChangedValue, localTextValue, locations]);

  const setValue = (newValue: Value) => {
    locations.forEach((location) => handleChange({ location, value: newValue }));
  };

  return (
    <Field label={column.name}>
      {column.dataType === 'boolean' ? (
        <Boolean
          isNullable={column.isNullable}
          setValue={setValue}
          value={value as boolean | undefined | null}
        />
      ) : (
        <Alphanumeric
          autoFocus={autoFocus}
          isNull={isNull}
          isNullable={column.isNullable}
          setLocalTextValue={setLocalTextValue}
          setValue={setValue}
          value={textValue}
        />
      )}
    </Field>
  );
};
