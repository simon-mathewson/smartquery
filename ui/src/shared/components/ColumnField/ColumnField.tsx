import classNames from 'classnames';
import React, { useState } from 'react';
import { CodeInput } from '~/shared/components/CodeInput/CodeInput';
import { Field } from '~/shared/components/Field/Field';
import { isEnumType } from '~/shared/dataTypes/utils';
import { type Column, type Value } from '~/shared/types';
import { Alphanumeric } from './Alphanumeric/Alphanumeric';
import { BooleanField } from './Boolean/Boolean';
import { EnumField } from './EnumField/EnumField';
import { NullButton } from './Null/Null';

export type ColumnFieldProps = {
  autoFocus?: boolean;
  className?: string;
  column: Column;
  hideLabel?: boolean;
  onChange: (newValue: Value) => void;
  placeholder?: string;
  value: Value;
};

export const ColumnField: React.FC<ColumnFieldProps> = (props) => {
  const {
    autoFocus,
    className,
    column,
    hideLabel,
    onChange: onChangeProp,
    placeholder,
    value,
  } = props;

  const [stringValue, setStringValue] = useState(value ?? '');

  const onChange = (newValue: Value) => {
    if (newValue !== null) {
      setStringValue(newValue ?? '');
    }
    onChangeProp(newValue);
  };

  return (
    <Field className={className} label={hideLabel ? undefined : column.name}>
      {column.dataType === 'boolean' ? (
        <BooleanField isNullable={column.isNullable} onChange={onChange} value={value} />
      ) : (
        <div
          className={classNames('w-full', {
            'opacity-50': value === null,
          })}
          onClickCapture={(event) => {
            if (value === null && stringValue) {
              onChange(stringValue);
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
                  onChange={onChange}
                  placeholder={placeholder}
                  stringValue={stringValue}
                />
              );
            }
            if (column.dataType === 'json') {
              return (
                <CodeInput
                  autoFocus={autoFocus}
                  language="sql"
                  onChange={onChange}
                  placeholder={placeholder}
                  value={stringValue === undefined ? '' : stringValue}
                />
              );
            }
            return (
              <Alphanumeric
                autoFocus={autoFocus}
                dataType={column.dataType!}
                onChange={onChange}
                placeholder={placeholder}
                stringValue={stringValue === undefined ? '' : stringValue}
              />
            );
          })()}
        </div>
      )}
      <NullButton isNullable={column.isNullable} onChange={onChange} value={value} />
    </Field>
  );
};
