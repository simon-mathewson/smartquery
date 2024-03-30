import React, { useMemo, useState } from 'react';
import { isNil } from 'lodash';
import { EditContext } from '~/content/edit/Context';
import type {
  UpdateLocation,
  CreateLocation,
  CreateChange,
  UpdateChange,
} from '~/content/edit/types';
import { type Column, type Value } from '~/shared/types';
import { Field } from '~/shared/components/Field/Field';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { BooleanField } from './Boolean/Boolean';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';
import { NullButton } from './Null/Null';
import { isEnumType } from '~/shared/dataTypes/utils';
import { EnumField } from './EnumField/EnumField';
import { CodeInput } from '~/shared/components/CodeInput/CodeInput';
import classNames from 'classnames';

export type ColumnFieldProps = {
  autoFocus?: boolean;
  column: Column;
  locations: Array<CreateLocation | UpdateLocation>;
};

export const ColumnField: React.FC<ColumnFieldProps> = (props) => {
  const { autoFocus, column, locations } = props;

  const { getChangeAtLocation, handleCreateChange, handleUpdateChange } =
    useDefinedContext(EditContext);

  const values = useMemo(
    () =>
      locations.map((location) => {
        const change = getChangeAtLocation(location) as CreateChange | UpdateChange | undefined;
        if (!change) {
          return location.type === 'update' ? location.originalValue : undefined;
        }
        return change.type === 'update' ? change.value : change.row[column.name];
      }),
    [column.name, getChangeAtLocation, locations],
  );

  const multipleValues = useMemo(() => !values.every((value) => value === values[0]), [values]);

  const value = values[0];
  const commonValue = multipleValues ? undefined : value;

  const [stringValue, setStringValue] = useState(() => {
    if (multipleValues) return '';

    const change = getChangeAtLocation(locations[0]) as CreateChange | UpdateChange | undefined;
    const firstValueChanged = change?.type === 'update' ? change.value : change?.row[column.name];

    if (!isNil(firstValueChanged)) return firstValueChanged;

    if (locations[0].type === 'create') return '';

    return locations[0].originalValue ?? '';
  });

  const setValue = (newValue: Value) => {
    if (newValue !== null) {
      setStringValue(newValue ?? '');
    }
    locations.forEach((location) => {
      if (location.type === 'create') {
        const createChange = getChangeAtLocation(location) as CreateChange;
        handleCreateChange({
          location,
          type: 'create',
          row: {
            ...createChange.row,
            [column.name]: newValue,
          },
        });
      } else {
        handleUpdateChange({ location, type: 'update', value: newValue });
      }
    });
  };

  return (
    <Field label={column.alias ?? column.name}>
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
                  value={stringValue === undefined ? '' : stringValue}
                />
              );
            }
            return (
              <Alphanumeric
                autoFocus={autoFocus}
                dataType={column.dataType!}
                multipleValues={multipleValues}
                setValue={setValue}
                stringValue={stringValue === undefined ? '' : stringValue}
              />
            );
          })()}
        </div>
      )}
      <NullButton commonValue={commonValue} isNullable={column.isNullable} setValue={setValue} />
    </Field>
  );
};
