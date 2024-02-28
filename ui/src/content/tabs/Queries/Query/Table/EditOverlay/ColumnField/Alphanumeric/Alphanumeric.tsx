import React, { useMemo } from 'react';
import type { DataType, Value } from '~/content/tabs/types';
import { Input } from '~/shared/components/Input/Input';
import { isDateTimeType, isIntegerType, isTimeType } from '../utils';

export type AlphanumericProps = {
  autoFocus?: boolean;
  dataType: DataType;
  multipleValues: boolean;
  setValue: (newValue: Value) => void;
  stringValue: string;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, dataType, multipleValues, stringValue, setValue } = props;

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
      onChange={setValue}
      placeholder={multipleValues ? 'Multiple values' : undefined}
      type={getType()}
      value={inputValue}
    />
  );
};
