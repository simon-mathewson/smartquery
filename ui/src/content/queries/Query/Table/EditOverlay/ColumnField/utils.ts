import { includes } from 'lodash';
import { DataType } from '~/content/queries/types';

export const isDateTimeType = (dataType: DataType) =>
  includes(
    ['datetime', 'timestamp', 'timestamp with time zone', 'timestamp without time zone'],
    dataType,
  );

export const isIntegerType = (dataType: DataType) => includes(['int', 'integer'], dataType);

export const isNumberType = (dataType: DataType) =>
  isIntegerType(dataType) || includes(['decimal'], dataType);

export const isTimeType = (dataType: DataType) =>
  includes(['time', 'time with time zone', 'time without time zone'], dataType);
