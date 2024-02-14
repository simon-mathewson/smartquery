import React from 'react';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Input } from '~/shared/components/Input/Input';
import classNames from 'classnames';

export type AlphanumericProps = {
  autoFocus?: boolean;
  isNull: boolean;
  isNullable?: boolean;
  setLocalTextValue: (newValue: string) => void;
  setValue: (newValue: string | null) => void;
  value: string | undefined;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, isNull, isNullable, setLocalTextValue, setValue, value } = props;

  return (
    <>
      <Input
        autoFocus={autoFocus}
        className={classNames('grow', { 'cursor-pointer': isNull })}
        onChange={(newValue) => {
          setLocalTextValue(newValue);
          setValue(newValue);
        }}
        onClick={() => {
          if (!isNull) return;
          setValue(value ?? '');
        }}
        placeholder={value === undefined ? 'Multiple values' : undefined}
        readOnly={isNull}
        value={value ?? ''}
      />
      {isNullable && (
        <ButtonSelect
          monospace
          onChange={(newValue) => setValue(newValue === null ? null : value ?? '')}
          options={[{ label: 'NULL', value: null }]}
          value={isNull ? null : undefined}
        />
      )}
    </>
  );
};
