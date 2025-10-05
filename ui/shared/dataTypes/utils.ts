import { includes } from 'lodash';
import type { DataType } from './types';

export const isDateTimeType = (dataType: DataType) =>
  includes(
    ['datetime', 'timestamp', 'timestamp with time zone', 'timestamp without time zone'],
    dataType,
  );

export const isEnumType = (dataType: DataType) => includes(['enum', 'user-defined'], dataType);

export const isIntegerType = (dataType: DataType) =>
  includes(['int', 'integer', 'tinyint', 'bigint'], dataType);

export const isNumberType = (dataType: DataType) =>
  isIntegerType(dataType) || dataType === 'decimal' || dataType.startsWith('numeric');

export const isTextType = (dataType: DataType) =>
  includes(['char', 'character varying', 'varchar', 'text'], dataType);

export const isTimeType = (dataType: DataType) =>
  includes(['time', 'time with time zone', 'time without time zone'], dataType);

export const isDateOrTimeType = (dataType: DataType) =>
  isDateTimeType(dataType) || isTimeType(dataType);
