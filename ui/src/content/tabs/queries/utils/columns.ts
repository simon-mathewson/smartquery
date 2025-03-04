import { sortBy, uniq } from 'lodash';
import type NodeSqlParser from 'node-sql-parser';
import type { DataType } from '~/shared/dataTypes/types';
import type { Column, Connection, DbValue } from '~/shared/types';
import type { Select } from '../types';

export const getMySqlEnumValuesFromColumnType = (columnType: string) => {
  if (!columnType.startsWith('enum(')) return null;

  return [...columnType.matchAll(/'((?:[^']|'')*)'/g)].map(([_, value]) =>
    value.replaceAll("''", "'"),
  );
};

export const getColumnsStatement = (props: {
  connection: Connection;
  select: Select;
  table: string;
}): string => {
  const {
    connection: { engine },
    select,
    table,
  } = props;

  if (engine === 'sqlite') {
    return `
      SELECT
        name AS column_name,
        cid AS ordinal_position,
        type AS data_type,
        CASE "notnull" WHEN 0 THEN 'YES' ELSE 'NO' END AS is_nullable,
        CASE pk WHEN 0 THEN '' ELSE 'PRIMARY KEY' END AS constraint_type
      FROM pragma_table_info('${table}')
      ORDER BY cid;
    `;
  }

  const isMysqlInformationSchemaQuery =
    engine === 'mysql' && select.schema === 'information_schema';
  const databaseColumn = engine === 'postgresql' ? 'table_catalog' : 'table_schema';

  return `
    SELECT
      c.column_name AS column_name,
      c.ordinal_position AS ordinal_position,
      c.data_type AS data_type,
      c.is_nullable AS is_nullable,
      tc.constraint_type AS constraint_type
      ${
        {
          mysql: ', c.column_type as mysql_column_type',
          postgresql: ', array_remove(array_agg(e.enumlabel), NULL) as postgres_enum_values',
        }[engine]
      }
    FROM information_schema.columns AS c
    ${
      engine === 'postgresql'
        ? `
          LEFT JOIN pg_type AS t ON c.udt_name = t.typname
          LEFT JOIN pg_enum AS e ON e.enumtypid = t.oid
        `
        : ''
    }
    LEFT JOIN information_schema.key_column_usage AS k
      ON k.column_name = c.column_name
      AND k.table_name = c.table_name
      AND k.${databaseColumn} = c.${databaseColumn}
    LEFT JOIN information_schema.table_constraints AS tc
      ON tc.constraint_name = k.constraint_name
      AND tc.table_name = k.table_name
      AND tc.${databaseColumn} = k.${databaseColumn}
    WHERE ${isMysqlInformationSchemaQuery ? 'LOWER(c.table_name)' : 'c.table_name'} = '${
      isMysqlInformationSchemaQuery ? table.toLowerCase() : table
    }'
    AND c.table_catalog = '${engine === 'postgresql' ? select.database : 'def'}'
    AND c.table_schema = '${engine === 'postgresql' ? select.schema : select.database}'
    ${
      engine === 'postgresql'
        ? `GROUP BY c.column_name, c.ordinal_position, c.data_type, c.is_nullable, tc.constraint_type`
        : ''
    }
    ORDER BY c.ordinal_position;
  `;
};

export const getColumnsFromResult = (props: {
  connection: Connection;
  parsedStatement: NodeSqlParser.Select;
  result: Record<string, DbValue>[];
}): Column[] => {
  const {
    connection: { engine },
    parsedStatement,
    result,
  } = props;

  const rawColumns = result as Array<{
    column_name: string;
    data_type: DataType;
    is_nullable: string;
    mysql_column_type?: string;
    postgres_enum_values?: string[];
    constraint_type: string;
  }>;

  const columnNames = uniq(rawColumns.map(({ column_name }) => column_name));

  return columnNames.map((name) => {
    const dataTypeRaw = rawColumns.find(({ column_name }) => column_name === name)!.data_type;

    const { is_nullable, mysql_column_type, postgres_enum_values } = rawColumns.find(
      ({ column_name }) => column_name === name,
    )!;

    const getEnumValues = () => {
      if (engine === 'mysql' && mysql_column_type) {
        return getMySqlEnumValuesFromColumnType(mysql_column_type);
      }

      if (engine === 'postgresql' && postgres_enum_values?.length) {
        return postgres_enum_values;
      }

      return null;
    };

    const orderedEnumValues = sortBy(getEnumValues());

    return {
      alias: parsedStatement.columns.find((column) => column.expr.column === name)?.as as
        | string
        | undefined,
      dataType: dataTypeRaw.toLowerCase() as DataType,
      enumValues: orderedEnumValues,
      isForeignKey: rawColumns.some(
        ({ column_name, constraint_type }) =>
          constraint_type === 'FOREIGN KEY' && column_name === name,
      ),
      isNullable: is_nullable === 'YES',
      isPrimaryKey: rawColumns.some(
        ({ column_name, constraint_type }) =>
          constraint_type === 'PRIMARY KEY' && column_name === name,
      ),
      isVisible: parsedStatement.columns.some(
        (column) => column.expr.column === '*' || column.expr.column === name,
      ),
      name,
    };
  }) satisfies Column[];
};
