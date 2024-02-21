import React from 'react';
import type { Value } from '~/content/queries/types';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';

export type NullButtonProps = {
  commonValue: Value | undefined;
  isNullable?: boolean;
  setValue: (newValue: Value) => void;
};

export const NullButton: React.FC<NullButtonProps> = (props) => {
  const { commonValue, isNullable, setValue } = props;

  if (!isNullable) return null;

  return (
    <ButtonSelect
      monospace
      onChange={(newValue) => {
        if (newValue === undefined) return;
        setValue(null);
      }}
      options={[{ label: 'NULL', value: null }]}
      value={commonValue === null ? null : undefined}
    />
  );
};
