import React from 'react';
import { isNil } from 'lodash';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';

export type BooleanProps = {
  isNullable?: boolean;
  setValue: (newValue: boolean | null) => void;
  value: boolean | undefined | null;
};

export const Boolean: React.FC<BooleanProps> = (props) => {
  const { isNullable, setValue, value } = props;

  return (
    <ButtonSelect<boolean | null>
      equalWidth
      fullWidth
      monospace
      onChange={(newValue) => {
        if (newValue === undefined && !isNullable) return;
        setValue(isNil(newValue) ? null : newValue);
      }}
      options={[
        { label: 'TRUE', value: true },
        { label: 'FALSE', value: false },
        ...(isNullable ? [{ label: 'NULL', value: null }] : []),
      ]}
      value={value as boolean | null | undefined}
    />
  );
};
