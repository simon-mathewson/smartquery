import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import type { Value } from '~/shared/types';

export type BooleanFieldProps = {
  isNullable?: boolean;
  onChange: (newValue: Value) => void;
  value: Value | undefined;
};

export const BooleanField: React.FC<BooleanFieldProps> = (props) => {
  const { isNullable, onChange, value } = props;

  return (
    <ButtonSelect<boolean | null>
      equalWidth
      fullWidth
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        onChange(isNil(newValue) ? null : String(newValue).toUpperCase());
      }}
      options={[
        { button: { label: 'TRUE', monospace: true }, value: true },
        { button: { label: 'FALSE', monospace: true }, value: false },
      ]}
      value={isNil(value) ? undefined : value.toLowerCase() === 'true' || value === '1'}
    />
  );
};
