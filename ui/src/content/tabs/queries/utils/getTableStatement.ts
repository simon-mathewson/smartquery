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
      WHERE name = '${table}'
    `,
    );
  }

  const isMysqlInformationSchemaQuery =
    engine === 'mysql' && select.database === 'information_schema';

  // Use table_type as column name to avoid case sensitivity issues
  return tables.map(
    (table) => `
    SELECT table_type AS table_type
    FROM information_schema.tables
    WHERE ${isMysqlInformationSchemaQuery ? 'LOWER(table_name)' : 'table_name'} = '${
      isMysqlInformationSchemaQuery ? table.originalName.toLowerCase() : table
    }'
    AND table_catalog = '${engine === 'postgres' ? select.database : 'def'}'
    AND table_schema = '${engine === 'postgres' ? select.schema : select.database}'
  `,
  );
};
