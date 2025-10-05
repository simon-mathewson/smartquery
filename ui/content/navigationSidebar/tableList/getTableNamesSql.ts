import type { ActiveConnection } from '~/shared/types';

export const getTableNamesSql = (activeConection: ActiveConnection) => {
  const { engine, database } = activeConection;

  switch (engine) {
    case 'mysql':
      return `
        SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema = '${database}'
        ORDER BY t ASC
      `;
    case 'postgres':
      return `
        SELECT table_name AS t, table_schema AS s FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        ${'schema' in activeConection ? `AND table_schema = '${activeConection.schema}'` : ''}
        AND table_catalog = '${database}'
        ORDER BY t ASC
      `;
    case 'sqlite':
      return `
        SELECT name AS t FROM sqlite_master
        WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY t ASC
      `;
  }
};
