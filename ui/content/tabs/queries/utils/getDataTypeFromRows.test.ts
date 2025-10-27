import { describe, expect, test } from 'vitest';
import { getDataTypeFromRows } from './getDataTypeFromRows';
import type { DbValue } from '@/connector/types';

describe('getDataTypeFromRows', () => {
  describe('Boolean detection', () => {
    test('detects boolean values', () => {
      const rows = [
        { column: 'true' },
        { column: 'false' },
        { column: 't' },
        { column: 'f' },
        { column: 'yes' },
        { column: 'no' },
        { column: 'y' },
        { column: 'n' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'boolean', isNullable: false });
    });

    test('detects nullable boolean values', () => {
      const rows = [{ column: 'true' }, { column: null }, { column: 'false' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'boolean', isNullable: true });
    });
  });

  describe('Numeric detection', () => {
    test('detects integer values', () => {
      const rows = [{ column: '1' }, { column: '42' }, { column: '-100' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('detects integers with separators', () => {
      const rows = [{ column: '1_000' }, { column: '10_000' }, { column: '1_000_000' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('detects decimal values', () => {
      const rows = [{ column: '1.5' }, { column: '3.14' }, { column: '-2.7' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'decimal', isNullable: false });
    });

    test('detects decimals with separators', () => {
      const rows = [{ column: '1_234.56' }, { column: '10_000.99' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'decimal', isNullable: false });
    });

    test('detects scientific notation', () => {
      const rows = [{ column: '1e5' }, { column: '2.5E-3' }, { column: '1.23e+10' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'decimal', isNullable: false });
    });

    test('detects scientific notation with separators', () => {
      const rows = [{ column: '1_000e5' }, { column: '2_500.5E-3' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'decimal', isNullable: false });
    });

    test('detects BigInt literals', () => {
      const rows = [{ column: '2n' }, { column: '123n' }, { column: '1_000_000n' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'bigint', isNullable: false });
    });

    test('detects binary literals', () => {
      const rows = [{ column: '0b1010' }, { column: '0B1111' }, { column: '0b1010_1010' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('detects octal literals', () => {
      const rows = [{ column: '0o755' }, { column: '0O777' }, { column: '0o7_55' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('detects hexadecimal literals', () => {
      const rows = [
        { column: '0xFF' },
        { column: '0xff' },
        { column: '0XABCD' },
        { column: '0xFF_FF' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('detects very large numbers as bigint', () => {
      const rows = [
        { column: '9007199254740992' }, // Number.MAX_SAFE_INTEGER + 1
        { column: '9007199254740993' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'bigint', isNullable: false });
    });
  });

  describe('Date/Time detection', () => {
    test('detects year-month values (YYYY-MM)', () => {
      const rows = [{ column: '2023-12' }, { column: '2024-01' }, { column: '1999-06' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects date-only values', () => {
      const rows = [{ column: '2023-12-25' }, { column: '2024-01-01' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'date', isNullable: false });
    });

    test('detects datetime values', () => {
      const rows = [{ column: '2023-12-25 10:30:00' }, { column: '2024-01-01 15:45:30' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects datetime with milliseconds', () => {
      const rows = [{ column: '2023-12-25 10:30:00.123' }, { column: '2024-01-01 15:45:30.456' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects ISO datetime format', () => {
      const rows = [{ column: '2023-12-25T10:30:00' }, { column: '2024-01-01T15:45:30.123Z' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects datetime with timezone', () => {
      const rows = [
        { column: '2023-12-25T10:30:00+02:00' },
        { column: '2024-01-01T15:45:30-05:00' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects time-only values', () => {
      const rows = [{ column: '10:30:00' }, { column: '15:45:30' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects time with milliseconds', () => {
      const rows = [{ column: '10:30:00.123' }, { column: '15:45:30.456' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('detects time with timezone', () => {
      const rows = [{ column: '10:30:00+02:00' }, { column: '15:45:30-05:00' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'datetime', isNullable: false });
    });

    test('rejects invalid year-month values', () => {
      const rows = [{ column: '2023-13' }, { column: '2023-00' }, { column: '2023-25' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'char', isNullable: false });
    });

    test('rejects invalid year-month format', () => {
      const rows = [{ column: '23-12' }, { column: '2023/12' }, { column: '2023_12' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });
  });

  describe('JSON detection', () => {
    test('detects JSON string values', () => {
      const rows = [
        { column: '{"name": "John", "age": 30}' },
        { column: '[1, 2, 3]' },
        { column: '{"nested": {"value": true}}' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'json', isNullable: false });
    });

    test('detects JSON objects', () => {
      const rows = [
        { column: JSON.stringify({ name: 'John', age: 30 }) },
        { column: JSON.stringify([1, 2, 3]) },
        { column: JSON.stringify({ nested: { value: true } }) },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'json', isNullable: false });
    });
  });

  describe('String detection', () => {
    test('detects char (fixed-length strings)', () => {
      const rows = [{ column: 'ABC' }, { column: 'XYZ' }, { column: '123' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'char', isNullable: false });
    });

    test('detects varchar (variable-length strings)', () => {
      const rows = [
        { column: 'Hello' },
        { column: 'World' },
        { column: 'This is a longer string' },
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });

    test('detects varchar for mixed-length strings', () => {
      const rows = [{ column: 'A' }, { column: 'AB' }, { column: 'ABC' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });
  });

  describe('Edge cases', () => {
    test('handles empty rows', () => {
      const rows: Record<string, DbValue>[] = [];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });

    test('handles all null values', () => {
      const rows = [{ column: null }, { column: null }, { column: null }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: true });
    });

    test('handles mixed null and non-null values', () => {
      const rows = [{ column: 'test' }, { column: null }, { column: 'value' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: true });
    });

    test('limits to first 10,000 rows', () => {
      const rows = Array.from({ length: 15000 }, (_, i) => ({ column: String(i) }));
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'int', isNullable: false });
    });

    test('handles mixed types (falls back to varchar)', () => {
      const rows = [{ column: 'string' }, { column: '123' }, { column: 'true' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });

    test('handles invalid JSON strings', () => {
      const rows = [{ column: '{"invalid": json}' }, { column: 'not json at all' }];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });

    test('handles invalid date strings', () => {
      const rows = [
        { column: 'not a date value' },
        { column: '2023-13-45' }, // Invalid date
      ];
      const result = getDataTypeFromRows(rows, 'column');
      expect(result).toEqual({ dataType: 'varchar', isNullable: false });
    });
  });

  describe('Column name handling', () => {
    test('handles missing column', () => {
      const rows = [{ otherColumn: 'test' }, { otherColumn: 'value' }];
      const result = getDataTypeFromRows(rows, 'missingColumn');
      expect(result).toEqual({ dataType: 'varchar', isNullable: true });
    });
  });
});
