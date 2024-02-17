import { isNil } from 'lodash';
import React from 'react';
import type { Column } from '~/content/queries/types';
import { Select } from '~/shared/components/Select/Select';

export type EnumFieldProps = {
  column: Column;
  isNullable?: boolean;
  multipleValues: boolean;
  setValue: (newValue: string | null) => void;
  value: string | null;
};

export const EnumField: React.FC<EnumFieldProps> = (props) => {
  const { column, isNullable, multipleValues, setValue, value } = props;

  return (
    <Select
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : newValue);
      }}
      options={column.enumValues!.map((value) => ({ label: value, value }))}
      value={multipleValues ? null : value}
    />
  );
};
