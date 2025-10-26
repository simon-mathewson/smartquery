import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import type { DbValue } from '@/connector/types';
import { getBooleanLabel } from '~/content/tabs/queries/utils/getBooleanLabel';

export type BooleanFieldProps = {
  isNullable?: boolean;
  onChange: (newValue: DbValue) => void;
  value: DbValue | undefined;
};

export const BooleanField: React.FC<BooleanFieldProps> = (props) => {
  const { isNullable, onChange, value } = props;

  const normalizedValue = value ? getBooleanLabel(value) : undefined;

  return (
    <ButtonSelect<boolean | null>
      fullWidth
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        onChange(isNil(newValue) ? null : String(newValue).toUpperCase());
      }}
      options={[
        { button: { label: 'TRUE', monospace: true }, value: true },
        { button: { label: 'FALSE', monospace: true }, value: false },
      ]}
      value={isNil(normalizedValue) ? undefined : normalizedValue === 'TRUE'}
    />
  );
};
