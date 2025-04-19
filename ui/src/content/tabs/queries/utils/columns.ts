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
}): [string, string?] => {
  const {
    connection: { engine },
    select,
    table,
  } = props;

  if (engine === 'sqlite') {
    return [
      `
        SELECT
          name AS column_name,
          cid AS ordinal_position,
          type AS data_type,
          CASE "notnull" WHEN 0 THEN 'YES' ELSE 'NO' END AS is_nullable,
          CASE pk WHEN 0 THEN '' ELSE 'PRIMARY KEY' END AS constraint_type
        FROM pragma_table_info('${table}')
        ORDER BY cid
      `,
      `
        SELECT * FROM pragma_foreign_key_list('${table}')
      `,
    ];
  }

  if (engine === 'mysql') {
    const isInformationSchemaQuery = select.database === 'information_schema';

    return [
      `
      SELECT
        c.column_name AS column_name,
        c.ordinal_position AS ordinal_position,
        c.data_type AS data_type,
        c.is_nullable AS is_nullable,
        kcu.referenced_table_schema AS foreign_key_table_schema,
        kcu.referenced_table_name AS foreign_key_table_name,
        kcu.referenced_column_name AS foreign_key_column_name,
        tc.constraint_type AS constraint_type,
        c.column_type as mysql_column_type
      FROM information_schema.columns AS c
      LEFT JOIN information_schema.key_column_usage AS kcu
        ON kcu.column_name = c.column_name
        AND kcu.table_name = c.table_name
        AND kcu.table_schema = c.table_schema
      LEFT JOIN information_schema.table_constraints AS tc
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_name = kcu.table_name
        AND tc.table_schema = kcu.table_schema
      WHERE ${isInformationSchemaQuery ? 'LOWER(c.table_name)' : 'c.table_name'} = '${
        isInformationSchemaQuery ? table.toLowerCase() : table
      }'
      AND c.table_schema = '${select.database}'
      ORDER BY c.ordinal_position;
    `,
    ];
  }

  return [
    `
    SELECT
      c.column_name AS column_name,
      c.ordinal_position AS ordinal_position,
      c.data_type AS data_type,
      c.is_nullable AS is_nullable,
      tc.constraint_type AS constraint_type,
      ccu.table_schema AS foreign_key_table_schema,
      ccu.table_name AS foreign_key_table_name,
      ccu.column_name AS foreign_key_column_name,
      array_remove(array_agg(e.enumlabel), NULL) as postgres_enum_values
    FROM information_schema.columns AS c
    LEFT JOIN pg_type AS t ON c.udt_name = t.typname
    LEFT JOIN pg_enum AS e ON e.enumtypid = t.oid
    LEFT JOIN information_schema.key_column_usage AS k
      ON k.column_name = c.column_name
      AND k.table_name = c.table_name
      AND k.table_catalog = c.table_catalog
    LEFT JOIN information_schema.table_constraints AS tc
      ON tc.constraint_name = k.constraint_name
      AND tc.table_name = k.table_name
      AND tc.table_catalog = k.table_catalog
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.constraint_schema = tc.table_schema
      AND ccu.constraint_catalog = tc.table_catalog
      AND tc.constraint_type = 'FOREIGN KEY'
    WHERE c.table_name = '${table}'
    AND c.table_catalog = '${select.database}'
    AND c.table_schema = '${select.schema}'
    GROUP BY c.column_name, c.ordinal_position, c.data_type, c.is_nullable, tc.constraint_type, ccu.table_schema, ccu.table_name, ccu.column_name
    ORDER BY c.ordinal_position;
  `,
  ];
};

export const getColumnsFromResult = (props: {
  connection: Connection;
  parsedStatement: NodeSqlParser.Select;
  result: Record<string, DbValue>[];
  sqliteForeignKeysResult: Record<string, DbValue>[] | null;
}): Column[] => {
  const {
    connection: { engine },
    parsedStatement,
    result,
    sqliteForeignKeysResult,
  } = props;

  const rawColumns = result as Array<{
    column_name: string;
    data_type: DataType;
    is_nullable: string;
    mysql_column_type?: string;
    postgres_enum_values?: string[];
    constraint_type: string;
    foreign_key_column_name: string | null;
    foreign_key_table_schema: string | null;
    foreign_key_table_name: string | null;
  }>;

  const columnNames = uniq(rawColumns.map(({ column_name }) => column_name));

  return columnNames.map((name) => {
    const column = rawColumns.find(({ column_name }) => column_name === name)!;

    const { is_nullable, mysql_column_type, postgres_enum_values, data_type: dataTypeRaw } = column;

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

    const getForeignKey = () => {
      if (sqliteForeignKeysResult) {
        const sqliteForeignKey = sqliteForeignKeysResult?.find(({ from }) => from === name);

        if (!sqliteForeignKey) return null;

        return {
          column: sqliteForeignKey.to as string,
          table: sqliteForeignKey.table as string,
        } as const;
      }

      if (
        column.constraint_type === 'FOREIGN KEY' &&
        column.foreign_key_column_name &&
        column.foreign_key_table_schema &&
        column.foreign_key_table_name
      ) {
        return {
          column: column.foreign_key_column_name,
          schema: column.foreign_key_table_schema,
          table: column.foreign_key_table_name,
        } as const;
      }

      return null;
    };

    return {
      alias: parsedStatement.columns.find((column) => column.expr.column === name)?.as as
        | string
        | undefined,
      dataType: dataTypeRaw.toLowerCase() as DataType,
      enumValues: orderedEnumValues,
      foreignKey: getForeignKey(),
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
