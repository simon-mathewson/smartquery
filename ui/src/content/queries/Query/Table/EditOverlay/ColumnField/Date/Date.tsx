import React, { useMemo } from 'react';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Input } from '~/shared/components/Input/Input';
import classNames from 'classnames';

export type DateFieldProps = {
  autoFocus?: boolean;
  isNullable?: boolean;
  multipleValues: boolean;
  setValue: (newValue: Date | null) => void;
  value: Date | null;
};

export const DateField: React.FC<DateFieldProps> = (props) => {
  const { autoFocus, isNullable, multipleValues, setValue, value } = props;

  const inputValue = useMemo(() => {
    if (multipleValues || value === null) return undefined;

    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }, [multipleValues, value]);

  return (
    <>
      <Input
        autoFocus={autoFocus}
        className={classNames('grow', { 'cursor-pointer': !multipleValues && value === null })}
        onChange={(newValue) => {
          setValue(new Date(newValue));
        }}
        onClick={() => {
          if (value !== null) return;
          setValue(new Date());
        }}
        placeholder={value === undefined ? 'Multiple values' : undefined}
        readOnly={!multipleValues && value === null}
        type="datetime-local"
        value={multipleValues ? undefined : inputValue}
      />
      {isNullable && (
        <ButtonSelect
          monospace
          onChange={(newValue) => setValue(newValue === null ? null : value)}
          options={[{ label: 'NULL', value: null }]}
          value={!multipleValues && value === null ? null : undefined}
        />
      )}
    </>
  );
};
