import React, { useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { EditContext } from '~/content/edit/Context';
import type { ChangeLocation, PrimaryKey } from '~/content/edit/types';
import type { Column, Query, Value } from '~/content/queries/types';
import { Field } from '~/shared/components/Field/Field';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { BooleanField } from './Boolean/Boolean';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';
import { NullButton } from './Null/Null';
import { isEnumType } from './utils';
import { EnumField } from './EnumField/EnumField';
import { CodeInput } from '~/shared/components/CodeInput/CodeInput';
import classNames from 'classnames';

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

  const value = values[0];
  const commonValue = multipleValues ? undefined : value;

  const [stringValue, setStringValue] = useState(() => {
    if (multipleValues) return '';

    const firstValueChanged = getChangedValue(locations[0]);

    if (!isNil(firstValueChanged)) return firstValueChanged;

    return locations[0].row.value ?? '';
  });

  const setValue = (newValue: Value) => {
    if (newValue !== null) {
      setStringValue(newValue);
    }
    locations.forEach((location) => handleChange({ location, value: newValue }));
  };

  return (
    <Field label={column.name}>
      {column.dataType === 'boolean' ? (
        <BooleanField
          commonValue={commonValue}
          isNullable={column.isNullable}
          setValue={setValue}
        />
      ) : (
        <div
          className={classNames('w-full', {
            'opacity-50': commonValue === null,
          })}
        >
          {(() => {
            if (isEnumType(column.dataType!) && column.enumValues) {
              return (
                <EnumField
                  column={column}
                  isNullable={column.isNullable}
                  multipleValues={multipleValues}
                  setValue={setValue}
                  stringValue={stringValue}
                />
              );
            }
            if (column.dataType === 'json') {
              return (
                <CodeInput
                  autoFocus={autoFocus}
                  language="sql"
                  onChange={setValue}
                  placeholder={multipleValues ? 'Multiple values' : undefined}
                  value={stringValue}
                />
              );
            }
            return (
              <Alphanumeric
                autoFocus={autoFocus}
                dataType={column.dataType!}
                multipleValues={multipleValues}
                setValue={setValue}
                stringValue={stringValue}
              />
            );
          })()}
        </div>
      )}
      <NullButton commonValue={commonValue} isNullable={column.isNullable} setValue={setValue} />
    </Field>
  );
};
