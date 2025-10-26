import type { Connection } from '@/connections/types';
import type { DbValue, Field } from '@/connector/types';
import { sortBy, uniqWith } from 'lodash';
import type { DataType } from '~/shared/dataTypes/types';
import type { Column } from '~/shared/types';
import type { Select } from '../types';
import { getVirtualColumn } from './getVirtualColumn';
import { assert } from 'ts-essentials';

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
    return tables.flatMap((table) => {
      const isInformationSchemaQuery = table.schema === 'information_schema';

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
          isInformationSchemaQuery ? table.originalName.toLowerCase() : table.originalName
        }'
          AND c.table_schema = '${table.schema}'
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
          AND kcu.table_schema = '${table.schema}'
      `,
      ];
    });
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
        AND c.table_schema = '${table.schema}'
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
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.constraint_schema = tc.table_schema
        AND tc.constraint_type = 'FOREIGN KEY'
      WHERE kcu.table_name = '${table.originalName}'
        AND kcu.table_schema = '${table.schema}'
    `,
  ]);
};

export const getTableInfo = (props: {
  columnsResults: Record<string, DbValue>[][];
  select: Select;
  tableIndex: number;
}) => {
  const { columnsResults, select, tableIndex } = props;

  const tableColumns = columnsResults[tableIndex * 2] as
    | Array<{
        column_name: string;
        data_type: DataType;
        is_nullable: string;
        mysql_column_type?: string;
        ordinal_position: string;
        postgres_enum_values?: string;
        sqlite_is_primary_key?: string;
        sqlite_is_unique?: string;
      }>
    | undefined;

  const tableConstraints = columnsResults[tableIndex * 2 + 1] as
    | Array<{
        column_name: string;
        constraint_type?: string;
        foreign_key_column_name: string;
        foreign_key_table_schema?: string;
        foreign_key_table_name: string;
      }>
    | undefined;

  return {
    ...select.tables[tableIndex],
    columns: tableColumns ?? [],
    constraints: tableConstraints ?? [],
  };
};

export const getColumn = (props: {
  column: {
    column_name: string;
    data_type: DataType;
    is_nullable: string;
    mysql_column_type?: string;
    postgres_enum_values?: string;
    sqlite_is_primary_key?: string;
    sqlite_is_unique?: string;
  };
  columnConstraints: {
    column_name: string;
    constraint_type?: string;
    foreign_key_column_name: string;
    foreign_key_table_schema?: string;
    foreign_key_table_name: string;
  }[];
  connection: Connection;
  fieldName: string;
  isVisible: boolean;
  tableInfo: ReturnType<typeof getTableInfo> | null;
}): Column => {
  const {
    column,
    columnConstraints,
    connection: { engine },
    fieldName,
    isVisible,
    tableInfo,
  } = props;

  assert(tableInfo, 'Table info is required');

  const {
    data_type,
    is_nullable,
    mysql_column_type,
    postgres_enum_values,
    sqlite_is_primary_key,
    sqlite_is_unique,
  } = column;

  const getEnumValues = () => {
    if (engine === 'mysql' && mysql_column_type) {
      return getMySqlEnumValuesFromColumnType(mysql_column_type);
    }

    if (engine === 'postgres') {
      const enumValues = postgres_enum_values?.slice(1, -1).split(',') ?? [];

      if (enumValues.length) {
        return enumValues;
      }

      return null;
    }

    return null;
  };

  const orderedEnumValues = sortBy(getEnumValues());

  const getForeignKey = () => {
    const constraint = columnConstraints.find(
      (c) => !c.constraint_type || c.constraint_type === 'FOREIGN KEY',
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
    sqlite_is_primary_key === '1' ||
    columnConstraints.some((c) => c.constraint_type === 'PRIMARY KEY');

  const isUnique =
    sqlite_is_unique === '1' || columnConstraints.some((c) => c.constraint_type === 'UNIQUE');

  return {
    dataType: data_type.toLowerCase() as DataType,
    enumValues: orderedEnumValues,
    foreignKey: getForeignKey(),
    isNullable: is_nullable === 'YES',
    isPrimaryKey,
    isUnique,
    isVisible,
    name: fieldName,
    originalName: column.column_name,
    table: {
      name: tableInfo.name,
      originalName: tableInfo.originalName,
      schema: tableInfo.schema,
    },
  } satisfies Column;
};

const getTableIndexForField = (props: {
  connection: Connection;
  field: Field;
  select: Select;
  tableResults: Record<string, DbValue>[][];
}) => {
  const { connection, field, select, tableResults } = props;

  if (select.tables.length === 1) {
    return 0;
  }

  // In SQLite, we can only get column information if the query selects from a single table.
  // Columns with the same name from different tables can't be distinguished.
  if (connection.engine === 'sqlite') {
    return -1;
  }

  return select.tables.findIndex((t, i) => {
    if (!('ref' in field)) {
      return false;
    }

    const { ref } = field;

    if ('table' in ref && ref.table && ref.schema) {
      return t.originalName === ref.table && t.schema === ref.schema;
    }

    if ('tableId' in ref) {
      const { oid } = tableResults[i][0];
      return parseInt(oid as string) === ref.tableId;
    }

    return false;
  });
};

export const getVisibleColumns = (props: {
  columnsResults: Record<string, DbValue>[][];
  connection: Connection;
  fields: Field[];
  records: Record<string, DbValue>[];
  select: Select;
  tableResults: Record<string, DbValue>[][];
}): Column[] => {
  const { columnsResults, connection, fields, records, select, tableResults } = props;

  return fields.map((field) => {
    if (field.type === 'virtual') {
      return getVirtualColumn(records, field.name);
    }

    const tableIndex = getTableIndexForField({
      connection,
      field,
      select,
      tableResults,
    });

    const tableInfo =
      tableIndex === -1
        ? null
        : getTableInfo({
            columnsResults,
            select,
            tableIndex,
          });

    const column = tableInfo?.columns.find((c) => {
      if ('ref' in field) {
        const { ref } = field;
        if ('column' in ref) {
          return c.column_name === ref.column;
        }
        if ('columnId' in ref) {
          return parseInt(c.ordinal_position) === ref.columnId;
        }
      }
      return c.column_name === field.name;
    });

    if (!column) {
      return getVirtualColumn(records, field.name);
    }

    const columnConstraints =
      tableInfo?.constraints.filter((c) => c.column_name === column.column_name) ?? [];

    return getColumn({
      column,
      columnConstraints,
      connection,
      fieldName: field.name,
      isVisible: true,
      tableInfo,
    });
  });
};

export const getInvisibleColumns = (props: {
  connection: Connection;
  columnsResults: Record<string, DbValue>[][];
  records: Record<string, DbValue>[];
  select: Select;
  visibleColumns: Column[];
}): Column[] => {
  const { connection, columnsResults, select, visibleColumns } = props;

  // In SQLite, we can only get column information if the query selects from a single table.
  // Columns with the same name from different tables can't be distinguished.
  if (connection.engine === 'sqlite' && select.tables.length > 1) {
    return [];
  }

  return columnsResults.flatMap((_, index) => {
    const tableIndex = Math.floor(index / 2);

    const tableInfo = getTableInfo({
      columnsResults,
      select,
      tableIndex,
    });

    const invisibleColumns = tableInfo.columns.filter(
      (c) =>
        !visibleColumns.some(
          (v) =>
            v.originalName === c.column_name &&
            v.table?.originalName === tableInfo.originalName &&
            v.table?.schema === tableInfo.schema,
        ),
    );

    return invisibleColumns.map((c) => {
      const columnConstraints = tableInfo.constraints.filter(
        (constraint) => constraint.column_name === c.column_name,
      );

      return getColumn({
        column: c,
        columnConstraints,
        connection,
        fieldName: c.column_name,
        isVisible: false,
        tableInfo,
      });
    });
  });
};

export const getAllColumns = (props: {
  connection: Connection;
  fields: Field[];
  columnsResults: Record<string, DbValue>[][];
  records: Record<string, DbValue>[];
  select: Select;
  tableResults: Record<string, DbValue>[][];
}): Column[] => {
  const { connection, fields, columnsResults, records, select, tableResults } = props;

  const visibleColumns = getVisibleColumns({
    columnsResults,
    connection,
    fields,
    records,
    select,
    tableResults,
  });

  const invisibleColumns = getInvisibleColumns({
    connection,
    columnsResults,
    records,
    select,
    visibleColumns,
  });

  const withDuplicates = [...visibleColumns, ...invisibleColumns];

  // If there are columns that can't be distinguished, we only keep the first.
  // This can happen with SQLite when selecting columns with the same name from multiple
  // tables. In this case, we don't know which tables the columns belong to.
  // Prefer visible columns.
  const tableColumns = uniqWith(
    sortBy(withDuplicates, (column) => (column.isVisible ? 0 : 1)),
    (a, b) =>
      a.name === b.name &&
      a.table?.originalName === b.table?.originalName &&
      a.table?.schema === b.table?.schema,
  );

  return tableColumns;
};
