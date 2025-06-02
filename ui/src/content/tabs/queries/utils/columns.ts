import { sortBy } from 'lodash';
import type NodeSqlParser from 'node-sql-parser';
import type { DataType } from '~/shared/dataTypes/types';
import type { Column, DbValue } from '~/shared/types';
import type { Connection } from '@/types/connection';
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
}): [string, string] => {
  const {
    connection: { engine },
    select,
    table,
  } = props;

  if (engine === 'sqlite') {
    return [
      /** Query columns and primary key */
      `
        SELECT
          name AS column_name,
          cid AS ordinal_position,
          type AS data_type,
          CASE "notnull" WHEN 0 THEN 'YES' ELSE 'NO' END AS is_nullable,
          pk AS sqlite_is_primary_key
        FROM pragma_table_info('${table}')
        ORDER BY cid
      `,
      /** Query foreign keys */
      `
        SELECT
          "from" AS column_name,
          "table" AS foreign_key_table_name,
          "to" AS foreign_key_column_name
        FROM pragma_foreign_key_list('${table}')
      `,
    ];
  }

  if (engine === 'mysql') {
    const isInformationSchemaQuery = select.database === 'information_schema';

    return [
      /** Query columns*/
      `
        SELECT
          c.column_name AS column_name,
          c.ordinal_position AS ordinal_position,
          c.data_type AS data_type,
          c.is_nullable AS is_nullable,
          c.column_type AS mysql_column_type
        FROM information_schema.columns AS c
        WHERE ${isInformationSchemaQuery ? 'LOWER(c.table_name)' : 'c.table_name'} = '${
          isInformationSchemaQuery ? table.toLowerCase() : table
        }'
          AND c.table_schema = '${select.database}'
        ORDER BY c.ordinal_position
      `,
      /** Query constraints */
      `
        SELECT
          kcu.column_name AS column_name,
          kcu.referenced_table_schema AS foreign_key_table_schema,
          kcu.referenced_table_name AS foreign_key_table_name,
          kcu.referenced_column_name AS foreign_key_column_name,
          tc.constraint_type AS constraint_type
        FROM information_schema.key_column_usage AS kcu
        LEFT JOIN information_schema.table_constraints AS tc
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_name = kcu.table_name
          AND tc.table_schema = kcu.table_schema
        WHERE ${isInformationSchemaQuery ? 'LOWER(kcu.table_name)' : 'kcu.table_name'} = '${
          isInformationSchemaQuery ? table.toLowerCase() : table
        }'
          AND kcu.table_schema = '${select.database}'
      `,
    ];
  }

  return [
    /** Query column types */
    `
      SELECT
        c.column_name AS column_name,
        c.ordinal_position AS ordinal_position,
        c.data_type AS data_type,
        c.is_nullable AS is_nullable,
        array_remove(array_agg(e.enumlabel), NULL) as postgres_enum_values
      FROM information_schema.columns AS c
      LEFT JOIN pg_type AS t ON c.udt_name = t.typname
      LEFT JOIN pg_enum AS e ON e.enumtypid = t.oid
      WHERE c.table_name = '${table}'
        AND c.table_schema = '${select.schema}'
        AND c.table_catalog = '${select.database}'
      GROUP BY c.column_name, c.ordinal_position, c.data_type, c.is_nullable
      ORDER BY c.ordinal_position
    `,
    /** Query constraints*/
    `
      SELECT
        kcu.column_name AS column_name,
        tc.constraint_type AS constraint_type,
        ccu.table_schema AS foreign_key_table_schema,
        ccu.table_name AS foreign_key_table_name,
        ccu.column_name AS foreign_key_column_name
      FROM information_schema.key_column_usage AS kcu
      LEFT JOIN information_schema.table_constraints AS tc
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_name = kcu.table_name
        AND tc.table_catalog = kcu.table_catalog
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.constraint_schema = tc.table_schema
        AND ccu.constraint_catalog = tc.table_catalog
        AND tc.constraint_type = 'FOREIGN KEY'
      WHERE kcu.table_name = '${table}'
        AND kcu.table_schema = '${select.schema}'
        AND kcu.table_catalog = '${select.database}'
    `,
  ];
};

export const getColumnsFromResult = (props: {
  connection: Connection;
  parsedStatement: NodeSqlParser.Select;
  columnsResult: Record<string, DbValue>[];
  constraintsResult: Record<string, DbValue>[];
}): Column[] => {
  const {
    connection: { engine },
    parsedStatement,
    columnsResult,
    constraintsResult: constraintsResultUntyped,
  } = props;

  const rawColumns = columnsResult as Array<{
    column_name: string;
    data_type: DataType;
    is_nullable: string;
    mysql_column_type?: string;
    postgres_enum_values?: string[];
    sqlite_is_primary_key?: number;
  }>;

  const constraintsResult = constraintsResultUntyped as Array<{
    column_name: string;
    constraint_type?: string;
    foreign_key_column_name: string;
    foreign_key_table_schema?: string;
    foreign_key_table_name: string;
  }>;

  const columnNames = rawColumns.map(({ column_name }) => column_name);

  return columnNames.map((name) => {
    const column = rawColumns.find(({ column_name }) => column_name === name)!;

    const {
      is_nullable,
      mysql_column_type,
      postgres_enum_values,
      data_type,
      sqlite_is_primary_key,
    } = column;

    const getEnumValues = () => {
      if (engine === 'mysql' && mysql_column_type) {
        return getMySqlEnumValuesFromColumnType(mysql_column_type);
      }

      if (engine === 'postgres' && postgres_enum_values?.length) {
        return postgres_enum_values;
      }

      return null;
    };

    const orderedEnumValues = sortBy(getEnumValues());

    const getForeignKey = () => {
      const constraint = constraintsResult.find(
        ({ column_name, constraint_type }) =>
          column_name === name && (!constraint_type || constraint_type === 'FOREIGN KEY'),
      );

      if (constraint) {
        return {
          column: constraint.foreign_key_column_name,
          schema: constraint.foreign_key_table_schema,
          table: constraint.foreign_key_table_name,
        } as const;
      }

      return null;
    };

    const isPrimaryKey =
      sqlite_is_primary_key === 1 ||
      constraintsResult.some(
        ({ column_name, constraint_type }) =>
          constraint_type === 'PRIMARY KEY' && column_name === name,
      );

    return {
      alias: parsedStatement.columns.find((column) => column.expr.column === name)?.as as
        | string
        | undefined,
      dataType: data_type.toLowerCase() as DataType,
      enumValues: orderedEnumValues,
      foreignKey: getForeignKey(),
      isNullable: is_nullable === 'YES',
      isPrimaryKey,
      isVisible: parsedStatement.columns.some(
        (column) => column.expr.column === '*' || column.expr.column === name,
      ),
      name,
    };
  }) satisfies Column[];
};
