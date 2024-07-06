import { isNil } from 'lodash';
import React from 'react';
import { type Column, type Value } from '~/shared/types';
import { Select } from '~/shared/components/select/Select';

export type EnumFieldProps = {
  column: Column;
  onChange: (newValue: Value) => void;
  placeholder?: string;
  stringValue: Value;
};

export const EnumField: React.FC<EnumFieldProps> = (props) => {
  const { column, onChange, placeholder, stringValue } = props;

  return (
    <Select
      monospace
      onChange={(newValue) => {
        if (newValue === undefined && !column.isNullable) return;
        onChange(isNil(newValue) ? null : newValue);
      }}
      options={column.enumValues!.map((value) => ({ label: value, value }))}
      placeholder={placeholder}
      value={stringValue === undefined ? null : stringValue}
    />
  );
};
