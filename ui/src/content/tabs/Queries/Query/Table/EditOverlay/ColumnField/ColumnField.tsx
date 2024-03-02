import React, { useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { EditContext } from '~/content/edit/Context';
import type { UpdateLocation, PrimaryKey } from '~/content/edit/types';
import type { Column, Query, Value } from '~/shared/types';
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

  const { getChange, handleChange } = useDefinedContext(EditContext);

  const locations = useMemo(
    () =>
      rows.map(
        (row) =>
          ({
            column: column.name,
            originalValue: row.value,
            primaryKeys: row.primaryKeys,
            table: query.table!,
          }) satisfies UpdateLocation,
      ),
    [column.name, query.table, rows],
  );

  const values = useMemo(
    () =>
      locations.map((location) => {
        const change = getChange(location);
        const changedValue = change?.type === 'update' ? change.value : undefined;
        return changedValue === undefined ? location.originalValue : changedValue;
      }),
    [getChange, locations],
  );

  const multipleValues = useMemo(() => !values.every((value) => value === values[0]), [values]);

  const value = values[0];
  const commonValue = multipleValues ? undefined : value;

  const [stringValue, setStringValue] = useState(() => {
    if (multipleValues) return '';

    const change = getChange(locations[0]);
    const firstValueChanged = change?.type === 'update' ? change.value : undefined;

    if (!isNil(firstValueChanged)) return firstValueChanged;

    return locations[0].originalValue ?? '';
  });

  const setValue = (newValue: Value) => {
    if (newValue !== null) {
      setStringValue(newValue);
    }
    locations.forEach((location) => handleChange({ location, type: 'update', value: newValue }));
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
          onClickCapture={(event) => {
            if (commonValue === null && stringValue) {
              setValue(stringValue);
              event.stopPropagation();
            }
          }}
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
