import classNames from 'classnames';
import React, { useState } from 'react';
import { CodeInput } from '~/shared/components/codeInput/CodeInput';
import { Field } from '~/shared/components/field/Field';
import { isEnumType } from '~/shared/dataTypes/utils';
import { type Column, type Value } from '~/shared/types';
import { Alphanumeric } from './alphanumeric/Alphanumeric';
import { BooleanField } from './boolean/Boolean';
import { EnumField } from './enumField/EnumField';
import { NullButton } from './null/Null';

export type ColumnFieldProps = {
  autoFocus?: boolean;
  column: Column;
  hideLabel?: boolean;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  onChange: (newValue: Value) => void;
  placeholder?: string;
  value: Value;
};

export const ColumnField: React.FC<ColumnFieldProps> = (props) => {
  const {
    autoFocus,
    column,
    hideLabel,
    htmlProps,
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
    <Field htmlProps={htmlProps} label={hideLabel ? undefined : column.name}>
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
                  onChange={onChange}
                  placeholder={placeholder}
                  stringValue={stringValue}
                />
              );
            }
            if (column.dataType === 'json') {
              return (
                <CodeInput
                  editorProps={{
                    autoFocus,
                    value: stringValue === undefined ? '' : stringValue,
                  }}
                  language="json"
                  onChange={onChange}
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
