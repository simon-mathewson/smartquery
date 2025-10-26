import React from 'react';
import type { DbValue } from '@/connector/types';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';

export type NullButtonProps = {
  isNullable?: boolean;
  onChange: (newValue: DbValue) => void;
  value: DbValue | undefined;
};

export const NullButton: React.FC<NullButtonProps> = (props) => {
  const { isNullable, onChange, value } = props;

  if (!isNullable) return null;

  return (
    <ButtonSelect
      onChange={(newValue) => {
        if (newValue === undefined) return;
        onChange(null);
      }}
      options={[
        {
          button: { label: 'NULL', monospace: true },
          value: null,
        },
      ]}
      value={value === null ? null : undefined}
    />
  );
};
