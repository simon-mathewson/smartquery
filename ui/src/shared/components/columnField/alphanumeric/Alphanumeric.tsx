import React, { useMemo } from 'react';
import type { Value } from '~/shared/types';
import { Input } from '~/shared/components/input/Input';
import { isDateTimeType, isIntegerType, isTimeType } from '~/shared/dataTypes/utils';
import type { DataType } from '~/shared/dataTypes/types';

export type AlphanumericProps = {
  autoFocus?: boolean;
  dataType: DataType;
  onChange: (newValue: Value) => void;
  placeholder?: string;
  stringValue: string;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, dataType, onChange, placeholder, stringValue } = props;

  const inputValue = useMemo(() => {
    if (isTimeType(dataType)) return stringValue.slice(0, 5);

    if (isDateTimeType(dataType)) return stringValue.slice(0, 16);

    return stringValue;
  }, [stringValue, dataType]);

  const getType = () => {
    if (isDateTimeType(dataType)) return 'datetime-local';
    if (isTimeType(dataType)) return 'time';
    if (isIntegerType(dataType)) return 'number';
    return 'text';
  };

  return (
    <Input
      autoFocus={autoFocus}
      element={getType() === 'text' ? 'textarea' : 'input'}
      onChange={onChange}
      placeholder={placeholder}
      type={getType()}
      value={inputValue}
    />
  );
};
