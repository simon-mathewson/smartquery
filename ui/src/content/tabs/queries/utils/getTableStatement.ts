import type { Connection } from '~/shared/types';
import type { Select } from '../types';

export const getTableStatement = (props: {
  connection: Connection;
  select: Select;
  table: string;
}): string => {
  const {
    connection: { engine },
    select,
    table,
  } = props;

  const isMysqlInformationSchemaQuery =
    engine === 'mysql' && select.schema === 'information_schema';

  // Use table_type as column name to avoid case sensitivity issues
  return `
    SELECT table_type AS table_type
    FROM information_schema.tables
    WHERE ${isMysqlInformationSchemaQuery ? 'LOWER(table_name)' : 'table_name'} = '${
      isMysqlInformationSchemaQuery ? table.toLowerCase() : table
    }'
    AND table_catalog = '${engine === 'postgresql' ? select.database : 'def'}'
    AND table_schema = '${engine === 'postgresql' ? select.schema : select.database}'
  `;
};
