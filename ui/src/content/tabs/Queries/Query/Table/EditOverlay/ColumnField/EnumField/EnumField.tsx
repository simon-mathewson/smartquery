import { isNil } from 'lodash';
import React from 'react';
import type { Column, Value } from '~/shared/types';
import { Select } from '~/shared/components/Select/Select';

export type EnumFieldProps = {
  column: Column;
  isNullable?: boolean;
  multipleValues: boolean;
  setValue: (newValue: Value) => void;
  stringValue: Value;
};

export const EnumField: React.FC<EnumFieldProps> = (props) => {
  const { column, isNullable, multipleValues, setValue, stringValue } = props;

  return (
    <Select
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : newValue);
      }}
      placeholder={multipleValues ? 'Multiple values' : undefined}
      options={column.enumValues!.map((value) => ({ label: value, value }))}
      value={stringValue}
    />
  );
};
