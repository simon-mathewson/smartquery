import { sortBy } from 'lodash';
import type NodeSqlParser from 'node-sql-parser';
import type { DataType } from '~/shared/dataTypes/types';
import type { Column, DbValue } from '~/shared/types';
import type { Connection } from '@/connections/types';
import type { Select } from '../types';

export const getMySqlEnumValuesFromColumnType = (columnType: string) => {
  if (!columnType.startsWith('enum(')) return null;

  return [...columnType.matchAll(/'((?:[^']|'')*)'/g)].map(([_, value]) =>
    value.replaceAll("''", "'"),
  );
};

export const getColumnsStatements = (props: {
  connection: Connection;
  select: Select;
}): string[] => {
  const {
    connection: { engine },
    select,
    select: { tables },
  } = props;

  if (engine === 'sqlite') {
    return tables.flatMap((table) => [
      /** Query columns and primary key */
      `
        SELECT
          table_info.name AS column_name,
          table_info.cid AS ordinal_position,
          table_info.type AS data_type,
          CASE table_info."notnull" WHEN 0 THEN 'YES' ELSE 'NO' END AS is_nullable,
          table_info.pk AS sqlite_is_primary_key,
          CASE WHEN index_info.cid IS NOT NULL THEN 1 ELSE 0 END AS sqlite_is_unique
        FROM pragma_table_info('${table.originalName}') as table_info
        LEFT JOIN (
          SELECT
            index_info.name AS index_name,
            index_info.name AS column_name,
            index_info.cid
          FROM pragma_index_list('${table.originalName}') AS index_list
          JOIN pragma_index_info(index_list.name) AS index_info
          WHERE index_list."unique" = 1
        ) AS index_info ON table_info.name = index_info.column_name
        ORDER BY table_info.cid
      `,
      /** Query foreign keys */
      `
        SELECT
          "from" AS column_name,
          "table" AS foreign_key_table_name,
          "to" AS foreign_key_column_name
        FROM pragma_foreign_key_list('${table.originalName}')
      `,
    ]);
  }

  if (engine === 'mysql') {
    const isInformationSchemaQuery = select.database === 'information_schema';

    return tables.flatMap((table) => [
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
          isInformationSchemaQuery ? table.originalName.toLowerCase() : table.originalName
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
          isInformationSchemaQuery ? table.originalName.toLowerCase() : table.originalName
        }'
          AND kcu.table_schema = '${select.database}'
      `,
    ]);
  }

  return tables.flatMap((table) => [
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
      WHERE c.table_name = '${table.originalName}'
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
      WHERE kcu.table_name = '${table.originalName}'
        AND kcu.table_schema = '${select.schema}'
        AND kcu.table_catalog = '${select.database}'
    `,
  ]);
};

export const getColumnsFromResult = (props: {
  connection: Connection;
  parsedStatement: NodeSqlParser.Select;
  columnsResult: Record<string, DbValue>[];
  constraintsResult: Record<string, DbValue>[];
  table: { name: string; originalName: string };
}): Column[] => {
  const {
    connection: { engine },
    parsedStatement,
    columnsResult,
    constraintsResult: constraintsResultUntyped,
    table,
  } = props;

  const rawColumns = columnsResult as Array<{
    column_name: string;
    data_type: DataType;
    is_nullable: string;
    mysql_column_type?: string;
    postgres_enum_values?: string[];
    sqlite_is_primary_key?: number;
    sqlite_is_unique?: number;
  }>;

  const constraintsResult = constraintsResultUntyped as Array<{
    column_name: string;
    constraint_type?: string;
    foreign_key_column_name: string;
    foreign_key_table_schema?: string;
    foreign_key_table_name: string;
  }>;

  return rawColumns.map(
    ({
      column_name,
      data_type,
      is_nullable,
      mysql_column_type,
      postgres_enum_values,
      sqlite_is_primary_key,
      sqlite_is_unique,
    }) => {
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
          (c) =>
            c.column_name === column_name &&
            (!c.constraint_type || c.constraint_type === 'FOREIGN KEY'),
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
          (c) => c.constraint_type === 'PRIMARY KEY' && c.column_name === column_name,
        );

      const isUnique =
        sqlite_is_unique === 1 ||
        constraintsResult.some(
          (c) => c.constraint_type === 'UNIQUE' && c.column_name === column_name,
        );

      const selectColumn = parsedStatement.columns.find((column) => {
        const expr = (column as NodeSqlParser.Column).expr;
        if ('column' in expr) {
          return expr.column === column_name && (!expr.table || expr.table === table.name);
        }
        return false;
      }) as NodeSqlParser.Column | undefined;

      const alias = typeof selectColumn?.as === 'string' ? selectColumn.as : null;
      const allColumnsSelected = parsedStatement.columns.some(
        (column) => column.expr.column === '*',
      );

      return {
        dataType: data_type.toLowerCase() as DataType,
        enumValues: orderedEnumValues,
        foreignKey: getForeignKey(),
        isNullable: is_nullable === 'YES',
        isPrimaryKey,
        isUnique,
        isVisible: allColumnsSelected || selectColumn !== undefined,
        name: alias ?? column_name,
        originalName: column_name,
        table,
      };
    },
  ) satisfies Column[];
};
