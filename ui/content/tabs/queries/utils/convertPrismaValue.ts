import { Decimal } from 'decimal.js';
import type { DataType } from '~/shared/dataTypes/types';
import { isTimeType } from '~/shared/dataTypes/utils';
import type { DbValue, Value } from '~/shared/types';

export const convertDbValue = (value: DbValue, dataType?: DataType): Value => {
  if (value === null) return null;

  if (value instanceof Date) {
    if (dataType && isTimeType(dataType)) {
      return value.toISOString().slice(11, 16);
    }

    const dateTimeString = value.toISOString().slice(0, 23);
    const dateTimeStringWithoutEmptyMilliseconds = dateTimeString.replace('.000', '');
    const dateTimeStringWithoutEmptySeconds = dateTimeStringWithoutEmptyMilliseconds.replace(
      ':00',
      '',
    );
    const dateTimeStringWithoutEmptyTime = dateTimeStringWithoutEmptySeconds.replace('T00:00', '');

    return dateTimeStringWithoutEmptyTime;
  }

  if (Decimal.isDecimal(value)) return value.toString();

  if (typeof value === 'object') return JSON.stringify(value);

  if (dataType === 'boolean') return String(value).toUpperCase();

  return String(value);
};
