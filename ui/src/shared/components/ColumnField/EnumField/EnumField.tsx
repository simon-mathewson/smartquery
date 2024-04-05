import { isNil } from 'lodash';
import React from 'react';
import { type Column, type Value } from '~/shared/types';
import { Select } from '~/shared/components/Select/Select';

export type EnumFieldProps = {
  column: Column;
  isNullable?: boolean;
  onChange: (newValue: Value) => void;
  placeholder?: string;
  stringValue: Value;
};

export const EnumField: React.FC<EnumFieldProps> = (props) => {
  const { column, isNullable, onChange, placeholder, stringValue } = props;

  return (
    <Select
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        onChange(isNil(newValue) ? null : newValue);
      }}
      placeholder={placeholder}
      options={column.enumValues!.map((value) => ({ label: value, value }))}
      value={stringValue === undefined ? null : stringValue}
    />
  );
};
