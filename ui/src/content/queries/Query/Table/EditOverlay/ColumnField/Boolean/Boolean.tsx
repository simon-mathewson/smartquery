import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import type { Value } from '~/content/queries/types';

export type BooleanFieldProps = {
  isNullable?: boolean;
  multipleValues: boolean;
  setValue: (newValue: Value) => void;
  value: Value;
};

export const BooleanField: React.FC<BooleanFieldProps> = (props) => {
  const { isNullable, multipleValues, setValue, value } = props;

  return (
    <ButtonSelect<boolean | null>
      equalWidth
      fullWidth
      monospace
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : String(newValue).toUpperCase());
      }}
      options={[
        { label: 'TRUE', value: true },
        { label: 'FALSE', value: false },
      ]}
      value={multipleValues || value === null ? undefined : value === 'TRUE'}
    />
  );
};
