import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import type { Value } from '~/content/queries/types';

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
      monospace
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : String(newValue).toUpperCase());
      }}
      options={[
        { label: 'TRUE', value: true },
        { label: 'FALSE', value: false },
      ]}
      value={isNil(commonValue) ? undefined : commonValue === 'TRUE'}
    />
  );
};
