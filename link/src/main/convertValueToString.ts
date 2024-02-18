import { Decimal } from '@prisma/client/runtime/library';
import { isTimeType } from './dataTypeUtils';
import type { DataType, PrismaValue } from './types';

export const convertPrismaValue = (value: PrismaValue, dataType?: DataType) => {
  if (value === null) return null;

  if (value instanceof Date) {
    if (dataType && isTimeType(dataType)) {
      return value.toISOString().slice(11, 16);
    }
    return value.toISOString().slice(0, 16);
  }

  if (Decimal.isDecimal(value)) return value.toString();

  if (typeof value === 'object') return JSON.stringify(value);

  if (dataType === 'boolean') return String(value).toUpperCase();

  return String(value);
};
