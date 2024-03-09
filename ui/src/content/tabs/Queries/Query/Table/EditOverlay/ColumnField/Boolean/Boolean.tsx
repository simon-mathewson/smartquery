import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import type { Value } from '~/shared/types';

export type BooleanFieldProps = {
  commonValue: Value | undefined;
  isNullable?: boolean;
  setValue: (newValue: Value) => void;
};

export const BooleanField: React.FC<BooleanFieldProps> = (props) => {
  const { commonValue, isNullable, setValue } = props;

  return (
    <ButtonSelect<boolean | null>
      equalWidth
      fullWidth
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : String(newValue).toUpperCase());
      }}
      options={[
        { button: { label: 'TRUE', monospace: true }, value: true },
        { button: { label: 'FALSE', monospace: true }, value: false },
      ]}
      value={isNil(commonValue) ? undefined : commonValue === 'TRUE'}
    />
  );
};
