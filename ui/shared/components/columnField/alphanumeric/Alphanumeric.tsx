import React, { useMemo } from 'react';
import type { DbValue } from '@/connector/types';
import { Input } from '~/shared/components/input/Input';
import { isDateTimeType, isIntegerType, isTimeType } from '~/shared/dataTypes/utils';
import type { DataType } from '~/shared/dataTypes/types';

export type AlphanumericProps = {
  autoFocus?: boolean;
  dataType: DataType;
  onChange: (newValue: DbValue) => void;
  placeholder?: string;
  stringValue: string;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, dataType, onChange, placeholder, stringValue } = props;

  const inputValue = useMemo(() => {
    if (isTimeType(dataType)) return stringValue.slice(0, 5);

    if (dataType === 'date') return stringValue.slice(0, 10);

    if (isDateTimeType(dataType)) return stringValue.slice(0, 16);

    return stringValue;
  }, [stringValue, dataType]);

  const getType = () => {
    if (dataType === 'date') return 'date';
    if (isDateTimeType(dataType)) return 'datetime-local';
    if (isTimeType(dataType)) return 'time';
    if (isIntegerType(dataType)) return 'number';
    return 'text';
  };

  return (
    <Input
      htmlProps={{
        autoFocus,
        placeholder,
        type: getType(),
        value: inputValue,
      }}
      element={getType() === 'text' ? 'textarea' : 'input'}
      onChange={onChange}
    />
  );
};
