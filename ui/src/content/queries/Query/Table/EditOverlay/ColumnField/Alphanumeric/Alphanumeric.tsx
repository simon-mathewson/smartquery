import classNames from 'classnames';
import { isNil } from 'lodash';
import React, { useMemo, useState } from 'react';
import type { DataType } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';
import { isDateTimeType, isIntegerType, isNumberType, isTimeType } from '../utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import type { ChangeLocation } from '~/content/edit/types';

export type AlphanumericProps = {
  autoFocus?: boolean;
  dataType: DataType;
  locations: ChangeLocation[];
  multipleValues: boolean;
  setValue: (newValue: Date | number | string | null) => void;
  value: Date | number | string | null;
};

export const Alphanumeric: React.FC<AlphanumericProps> = (props) => {
  const { autoFocus, dataType, locations, multipleValues, setValue: setValueProp, value } = props;

  const { getChangedValue } = useDefinedContext(EditContext);

  const [localTextValue, setLocalTextValue] = useState(() => {
    const firstValueChanged = getChangedValue(locations[0]);

    if (!isNil(firstValueChanged)) return String(firstValueChanged);

    const firstValueOriginalValue = locations[0].row.value;
    return firstValueOriginalValue ? String(firstValueOriginalValue) : '';
  });

  const inputValue = useMemo(() => {
    if (multipleValues || value === null) return localTextValue;

    if (isTimeType(dataType)) {
      if (value === null) return localTextValue;
      if (value instanceof Date) return new Date(value).toISOString().slice(11, 16);
      return value as string;
    }

    if (value instanceof Date) {
      const date = new Date(value);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    }

    return value === null ? localTextValue : String(value);
  }, [dataType, localTextValue, multipleValues, value]);

  const getType = () => {
    if (isDateTimeType(dataType)) return 'datetime-local';
    if (isTimeType(dataType)) return 'time';
    if (isIntegerType(dataType)) return 'number';
    return 'text';
  };

  const setValue = (newValue: string | null) => {
    if (isTimeType(dataType)) {
      if (newValue === null) return setValueProp(null);
      setValueProp(newValue);
    } else if (isDateTimeType(dataType)) {
      if (newValue === null) return setValueProp(null);
      setValueProp(newValue ? new Date(newValue) : new Date());
    } else if (isNumberType(dataType)) {
      setValueProp(newValue === null ? null : Number(newValue));
    } else {
      setValueProp(newValue);
    }
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
