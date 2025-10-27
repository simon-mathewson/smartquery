import { sortBy } from 'lodash';

export const getMySqlEnumValuesFromColumnType = (columnType: string) => {
  if (!columnType.startsWith('enum(')) return null;

  return [...columnType.matchAll(/'((?:[^']|'')*)'/g)].map(([_, value]) =>
    value.replaceAll("''", "'"),
  );
};

export const getEnumValues = (
  column: {
    postgres_enum_values?: string;
    mysql_column_type?: string;
  },
  engine: string,
) => {
  if (engine === 'mysql' && column.mysql_column_type) {
    return getMySqlEnumValuesFromColumnType(column.mysql_column_type);
  }

  if (engine === 'postgres') {
    const enumValuesString = column.postgres_enum_values?.slice(1, -1);
    const enumValues = enumValuesString ? enumValuesString.split(',') : [];

    if (enumValues.length) {
      return enumValues;
    }
  }

  return null;
};

export const getSortedEnumValues = (
  column: {
    postgres_enum_values?: string;
    mysql_column_type?: string;
  },
  engine: string,
) => {
  const enumValues = getEnumValues(column, engine);
  return enumValues ? sortBy(enumValues) : null;
};
