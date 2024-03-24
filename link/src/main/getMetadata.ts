import { castArray, sortBy, uniq } from 'lodash';
import type { Client, Column, DataType } from './types';
import { getMySqlEnumValuesFromColumnType } from './getMySqlEnumValuesFromColumnType';
import NodeSqlParser from 'node-sql-parser';
import type { PostgresClient } from '../../prisma';

export const getColumns = async (parsedQuery: NodeSqlParser.AST, client: Client) => {
  const { engine } = client.connection;
  const databaseColumn = engine === 'mysql' ? 'table_schema' : 'table_catalog';

  if (
    parsedQuery.type !== 'select' ||
    !parsedQuery.from ||
    parsedQuery.from.length !== 1 ||
    !parsedQuery.from[0].table ||
    parsedQuery.columns.some((column) => column.expr.type !== 'column_ref')
  ) {
    return null;
  }

  const table = parsedQuery.from[0].table as string;
  const database = (parsedQuery.from[0].db as string | null) ?? client.connection.database;

  const sql = `
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

  const rawColumns = await (client.prisma as PostgresClient).$queryRawUnsafe<
    Array<{
      column_name: string;
      data_type: DataType;
      is_nullable: string;
      mysql_column_type?: string;
      postgres_enum_values?: string[];
      constraint_type: string;
    }>
  >(sql);

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
      alias: parsedQuery.columns.find((column) => column.expr.column === name)?.as as
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
      isVisible: parsedQuery.columns.some(
        (column) => column.expr.column === '*' || column.expr.column === name,
      ),
      name,
    };
  }) satisfies Column[];
};

export const getMetadata = async (props: { client: Client; statement: string }) => {
  const { client, statement } = props;

  const sqlParser = new NodeSqlParser.Parser();
  const parserOptions = {
    database: {
      mysql: 'mysql',
      postgresql: 'postgresql',
    }[client.connection.engine],
  };

  try {
    const parsedQuery = castArray(sqlParser.astify(statement, parserOptions))[0];
    const table = parsedQuery.type === 'select' ? parsedQuery.from?.at(0).table : null;
    const columns = await getColumns(parsedQuery, client);
    return { columns, table };
  } catch {
    return null;
  }
};
