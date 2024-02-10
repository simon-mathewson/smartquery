import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { isNil } from 'lodash';
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

  const { isNull, textValue } = useMemo(() => {
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
    };
  }, [getChangedValue, localTextValue, locations]);

  return (
    <Field label={column.name}>
      <Input
        autoFocus={autoFocus}
        className={classNames({ 'cursor-pointer': isNull })}
        key={column.name}
        onChange={(newValue) => {
          setLocalTextValue(newValue);
          locations.forEach((location) => handleChange({ location, value: newValue }));
        }}
        onClick={() => {
          if (!isNull) return;

          locations.forEach((location) => handleChange({ location, value: textValue ?? '' }));
        }}
        placeholder={textValue === undefined ? 'Multiple values' : undefined}
        readOnly={isNull}
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
