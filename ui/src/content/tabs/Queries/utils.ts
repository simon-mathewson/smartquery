import { cloneDeep } from 'lodash';
import type NodeSqlParser from 'node-sql-parser';
import type { Column, PrismaValue, Query, Value, Row } from '~/shared/types';
import { sortBy, uniq } from 'lodash';
import type { AddQueryOptions, Select } from './types';
import * as uuid from 'uuid';
import type { Connection } from '~/shared/types';
import { isTimeType } from '~/shared/dataTypes/utils';
import { Decimal } from 'decimal.js';
import type { DataType } from '~/shared/dataTypes/types';
import { parseStatements } from '~/shared/utils/sql';
import { getParsedStatement, getParserOptions, sqlParser } from '~/shared/utils/parser';

export const getPrimaryKeys = (columns: Column[], rows: Row[], rowIndex: number) => {
  const primaryKeyColumns = columns.filter((column) => column.isPrimaryKey);

  const row = rows.at(rowIndex);
  if (!row) return null;

  const arePrimaryKeysAvailable = primaryKeyColumns.every((column) => column.name in row);
  if (!arePrimaryKeysAvailable) return null;

  return primaryKeyColumns.map((column) => ({
    column: column.name,
    value: rows[rowIndex][column.name] as string,
  }));
};

export const getLimitAndOffset = (parsedQuery: NodeSqlParser.Select) => {
  if (
    !parsedQuery?.limit ||
    (parsedQuery.limit.seperator === 'offset' && parsedQuery.limit.value.length < 2)
  ) {
    return null;
  }

  const limitIndex = parsedQuery.limit.seperator === ',' ? 1 : 0;
  const offsetIndex = parsedQuery.limit.seperator === ',' ? 0 : 1;

  return {
    limit: parsedQuery.limit.value.at(limitIndex)?.value,
    offset: parsedQuery.limit.value.at(offsetIndex)?.value,
  };
};

export const setLimitAndOffset = (
  parsedQuery: NodeSqlParser.Select,
  limit: number,
  offset?: number,
) => {
  const value = [{ type: 'number', value: limit }];

  if (offset !== undefined) {
    value.push({ type: 'number', value: offset });
  }

  parsedQuery.limit = { seperator: ' OFFSET', value };
};

const getSelectFromStatement = (props: {
  engine: Connection['engine'];
  statement: string;
}): Select | null => {
  const { engine, statement } = props;

  const parsed = getParsedStatement({ engine, statement });

  if (
    !parsed ||
    parsed.type !== 'select' ||
    parsed.from?.length !== 1 ||
    parsed.columns.some((column) => column.expr.type !== 'column_ref' || column.as !== null)
  ) {
    return null;
  }

  const table = parsed.from[0].table;
  if (!table) return null;

  return { parsed, table };
};

export const parseQuery = (props: {
  engine: Connection['engine'];
  sql: string;
}): {
  select: Select | null;
  statements: string[] | null;
} => {
  const { engine, sql } = props;

  const statements = parseStatements(sql);

  const select =
    statements.length === 1 ? getSelectFromStatement({ engine, statement: statements[0] }) : null;

  return {
    select,
    statements,
  };
};

export const getNewQuery = (props: {
  addQueryOptions: AddQueryOptions;
  engine: Connection['engine'];
}) => {
  const {
    addQueryOptions: { showEditor, sql },
    engine,
  } = props;

  return {
    id: uuid.v4(),
    showEditor: showEditor === true,
    sql: sql ?? null,
    ...(sql ? parseQuery({ engine, sql }) : { select: null, statements: null }),
  } satisfies Query;
};

export const getMySqlEnumValuesFromColumnType = (columnType: string) => {
  if (!columnType.startsWith('enum(')) return null;

  return [...columnType.matchAll(/'((?:[^']|'')*)'/g)].map(([_, value]) =>
    value.replaceAll("''", "'"),
  );
};

export const getColumnsStatement = (props: { connection: Connection; table: string }): string => {
  const {
    connection: { database, engine },
    table,
  } = props;

  const databaseColumn = engine === 'mysql' ? 'table_schema' : 'table_catalog';

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
    WHERE c.table_name = '${table}'
    AND c.${databaseColumn} = '${database}'
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
  result: Record<string, PrismaValue>[];
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

export const convertPrismaValue = (value: PrismaValue, dataType?: DataType): Value => {
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

export const getTotalRowsStatement = (props: { connection: Connection; select: Select }) => {
  const { connection, select } = props;

  const totalQuery = cloneDeep(select.parsed);

  totalQuery.limit = null;
  totalQuery.columns = [
    {
      expr: { type: 'aggr_func', name: 'COUNT', args: { expr: { type: 'star', value: '*' } } },
      as: 'count',
    },
  ];

  try {
    const statement = sqlParser.sqlify(totalQuery, getParserOptions(connection.engine));
    return statement;
  } catch (error) {
    console.error(error);
    return null;
  }
};
