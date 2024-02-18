import React from 'react';
import type { Value } from '~/content/queries/types';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';

export type NullButtonProps = {
  isNullable?: boolean;
  multipleValues: boolean;
  setValue: (newValue: Value) => void;
  value: Value;
};

export const NullButton: React.FC<NullButtonProps> = (props) => {
  const { isNullable, multipleValues, setValue, value } = props;

  if (!isNullable) return null;

  return (
    <ButtonSelect
      monospace
      onChange={(newValue) => {
        if (newValue === undefined) return;
        setValue(null);
      }}
      options={[{ label: 'NULL', value: null }]}
      value={!multipleValues && value === null ? null : undefined}
    />
  );
};
