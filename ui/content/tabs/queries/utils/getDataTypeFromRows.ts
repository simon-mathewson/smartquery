import type { DbValue } from '@/connector/types';
import type { DataType } from '~/shared/dataTypes/types';

const REGEX_PATTERNS = {
  // Numeric patterns
  INTEGER: /^-?\d+(_\d+)*$/,
  BIGINT_LITERAL: /^-?\d+(_\d+)*n$/,
  DECIMAL: /^-?\d+(_\d+)*\.\d+$/,
  SCIENTIFIC: /^-?\d+(_\d+)*(\.\d+(_\d+)*)?[eE][+-]?\d+(_\d+)*$/,
  BINARY: /^-?0[bB][01]+(_[01]+)*$/,
  OCTAL: /^-?0[oO][0-7]+(_[0-7]+)*$/,
  HEXADECIMAL: /^-?0[xX][0-9a-fA-F]+(_[0-9a-fA-F]+)*$/,

  // Date/time patterns
  YEAR_MONTH: /^\d{4}-\d{2}$/,
  DATE_ONLY: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
  ISO_DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/,
  DATETIME_MILLIS: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/,
  TIME_WITH_MILLIS: /^\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2})?$/,

  // Other patterns
  BOOLEAN: /^(true|false|t|f|yes|no|y|n)$/i,
} as const;

export const getDataTypeFromRows = (
  rows: Record<string, DbValue>[],
  column: string,
): { dataType: DataType; isNullable: boolean } => {
  const allValues = rows.map((row) => row[column] ?? null).slice(0, 10_000);
  const values = allValues.filter((value) => value !== null);
  const isNullable = allValues.some((value) => value === null);

  if (values.length === 0) {
    return { dataType: 'varchar', isNullable }; // Default to varchar for empty columns
  }

  // Check for boolean values
  const isAllBoolean = values.every((value) => REGEX_PATTERNS.BOOLEAN.test(value));
  if (isAllBoolean) {
    return { dataType: 'boolean', isNullable };
  }

  // Check for numeric values
  const isAllNumeric = values.every(
    (value) =>
      REGEX_PATTERNS.INTEGER.test(value) ||
      REGEX_PATTERNS.BIGINT_LITERAL.test(value) ||
      REGEX_PATTERNS.DECIMAL.test(value) ||
      REGEX_PATTERNS.SCIENTIFIC.test(value) ||
      REGEX_PATTERNS.BINARY.test(value) ||
      REGEX_PATTERNS.OCTAL.test(value) ||
      REGEX_PATTERNS.HEXADECIMAL.test(value),
  );
  if (isAllNumeric) {
    // Determine if it's integer or decimal
    const hasDecimal = values.some(
      (value) => REGEX_PATTERNS.DECIMAL.test(value) || REGEX_PATTERNS.SCIENTIFIC.test(value),
    );

    if (hasDecimal) {
      return { dataType: 'decimal', isNullable };
    } else {
      // Check if it's a bigint (very large numbers or BigInt literals)
      const hasBigInt = values.some((value) => {
        // Check for BigInt literals (2n, 123n)
        if (REGEX_PATTERNS.BIGINT_LITERAL.test(value)) return true;
        // Check for very large numbers (remove separators first)
        const cleanValue = value.replace(/_/g, '');
        const num = parseInt(cleanValue, 10);
        return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER;
      });
      return { dataType: hasBigInt ? 'bigint' : 'int', isNullable };
    }
  }

  const isAllDateOnly = values.every((value) => REGEX_PATTERNS.DATE_ONLY.test(value));
  if (isAllDateOnly) {
    return { dataType: 'date', isNullable };
  }

  // Check for date/time values
  const isAllDateTime = values.every((value) => {
    // Check year-month pattern first with validation
    if (REGEX_PATTERNS.YEAR_MONTH.test(value)) {
      const [, month] = value.split('-').map(Number);
      return month >= 1 && month <= 12;
    }

    // Check other date formats
    const otherDateFormats = [
      REGEX_PATTERNS.DATETIME,
      REGEX_PATTERNS.ISO_DATETIME,
      REGEX_PATTERNS.DATETIME_MILLIS,
    ];

    if (otherDateFormats.some((format) => format.test(value))) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
  });
  if (isAllDateTime) {
    return { dataType: 'datetime', isNullable };
  }

  // Check for time-only values
  const isAllTime = values.every((value) => REGEX_PATTERNS.TIME_WITH_MILLIS.test(value));
  if (isAllTime) {
    return { dataType: 'datetime', isNullable };
  }

  // Check for fixed-length strings (char)
  const lengths = values.map((value) => (value as string).length);
  const uniqueLengths = new Set(lengths);

  // If all strings have the same length and it's relatively short, it might be char
  if (uniqueLengths.size === 1 && lengths[0] <= 10) {
    return { dataType: 'char', isNullable };
  }

  // Check for JSON values
  const isAllJson = values.every((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  });
  if (isAllJson) {
    return { dataType: 'json', isNullable };
  }

  // Default to varchar for text data
  return { dataType: 'varchar', isNullable };
};
