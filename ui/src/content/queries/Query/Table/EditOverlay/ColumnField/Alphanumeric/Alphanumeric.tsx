import React, { useState } from 'react';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { isNil } from 'lodash';
import { Input } from '~/shared/components/Input/Input';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import { ChangeLocation } from '~/content/edit/types';

export type AlphanumericProps = {
  autoFocus?: boolean;
  isNullable?: boolean;
  locations: ChangeLocation[];
  multipleValues: boolean;
  setValue: (newValue: string | null) => void;
  value: string | null;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, isNullable, locations, multipleValues, setValue, value } = props;

  const { getChangedValue } = useDefinedContext(EditContext);

  const [localTextValue, setLocalTextValue] = useState(() => {
    const firstValueChanged = getChangedValue(locations[0]);

    if (!isNil(firstValueChanged)) return String(firstValueChanged);

    const firstValueOriginalValue = locations[0].row.value;
    return firstValueOriginalValue ? String(firstValueOriginalValue) : '';
  });

  const valueAsString = value === null ? localTextValue : String(value);

  return (
    <>
      <Input
        autoFocus={autoFocus}
        className={classNames('grow', { 'cursor-pointer': !multipleValues && value === null })}
        onChange={(newValue) => {
          setLocalTextValue(newValue);
          setValue(newValue);
        }}
        onClick={() => {
          if (value !== null) return;
          setValue(valueAsString);
        }}
        placeholder={value === undefined ? 'Multiple values' : undefined}
        readOnly={!multipleValues && value === null}
        value={multipleValues ? undefined : valueAsString}
      />
      {isNullable && (
        <ButtonSelect
          monospace
          onChange={(newValue) => setValue(newValue === null ? null : valueAsString)}
          options={[{ label: 'NULL', value: null }]}
          value={!multipleValues && value === null ? null : undefined}
        />
      )}
    </>
  );
};
