import type { Connection } from '@/connections/types';
import type { Select } from '../types';

export const getTableStatements = (props: { connection: Connection; select: Select }): string[] => {
  const {
    connection: { engine },
    select,
    select: { tables },
  } = props;

  if (engine === 'sqlite') {
    return tables.map(
      (table) => `
      SELECT CASE type WHEN 'table' THEN 'BASE TABLE' ELSE '' END AS table_type
      FROM sqlite_master
      WHERE name = '${table.originalName}'
    `,
    );
  }

  if (engine === 'mysql') {
    const isMysqlInformationSchemaQuery = select.tables[0].schema === 'information_schema';

    // Use table_type as column name to avoid case sensitivity issues
    return tables.map(
      (table) => `
    SELECT table_type AS table_type
    FROM information_schema.tables
    WHERE ${isMysqlInformationSchemaQuery ? 'LOWER(table_name)' : 'table_name'} = '${
      isMysqlInformationSchemaQuery ? table.originalName.toLowerCase() : table.originalName
    }'
    AND table_schema = '${table.schema}'
  `,
    );
  }

  return tables.map(
    (table) => `
      SELECT
        t.table_type,
        c.oid
      FROM
        information_schema.tables AS t
        JOIN pg_catalog.pg_class AS c ON t.table_name = c.relname
        JOIN pg_catalog.pg_namespace AS n ON c.relnamespace = n.oid
        AND t.table_schema = n.nspname
      WHERE t.table_name = '${table.originalName}'
      AND t.table_schema = '${table.schema}'
`,
  );
};
