import classNames from 'classnames';
import { isNil } from 'lodash';
import React, { useMemo, useState } from 'react';
import type { DataType, Value } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';
import { isDateTimeType, isIntegerType, isTimeType } from '../utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import type { ChangeLocation } from '~/content/edit/types';

export type AlphanumericProps = {
  autoFocus?: boolean;
  dataType: DataType;
  locations: ChangeLocation[];
  multipleValues: boolean;
  setValue: (newValue: Value) => void;
  value: Value;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, dataType, locations, multipleValues, setValue, value } = props;

  const { getChangedValue } = useDefinedContext(EditContext);

  const [localTextValue, setLocalTextValue] = useState(() => {
    const firstValueChanged = getChangedValue(locations[0]);

    if (!isNil(firstValueChanged)) return String(firstValueChanged);

    const firstValueOriginalValue = locations[0].row.value;
    return firstValueOriginalValue ? String(firstValueOriginalValue) : '';
  });

  const inputValue = useMemo(() => {
    if (multipleValues || value === null) return localTextValue;

    if (isTimeType(dataType)) return value.slice(0, 5);

    if (isDateTimeType(dataType)) return value.slice(0, 16);

    return value === null ? localTextValue : value;
  }, [dataType, localTextValue, multipleValues, value]);

  const getType = () => {
    if (isDateTimeType(dataType)) return 'datetime-local';
    if (isTimeType(dataType)) return 'time';
    if (isIntegerType(dataType)) return 'number';
    return 'text';
  };

  return (
    <Input
      autoFocus={autoFocus}
      className={classNames('grow', { 'cursor-pointer': !multipleValues && value === null })}
      onChange={(newValue) => {
        setLocalTextValue(newValue);
        setValue(newValue);
      }}
      onClick={() => {
        if (value !== null) return;
        setValue(inputValue);
      }}
      placeholder={value === undefined ? 'Multiple values' : undefined}
      readOnly={!multipleValues && value === null}
      type={getType()}
      value={multipleValues ? undefined : inputValue}
    />
  );
};
