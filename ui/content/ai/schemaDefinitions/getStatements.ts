import type { ActiveConnection } from '~/shared/types';

export const getStatements = (
  activeConnection: Extract<ActiveConnection, { connectorId: string }>,
) => {
  const { engine, database } = activeConnection;

  switch (engine) {
    case 'postgres':
      return [
        `
        SELECT table_name, table_type FROM information_schema.tables 
        WHERE table_schema = '${activeConnection.schema}'
      `,
        `
        SELECT 
          c.table_name, 
          c.column_name, 
          c.ordinal_position, 
          c.column_default, 
          c.is_nullable, 
          c.data_type, 
          c.character_maximum_length, 
          c.numeric_precision, 
          c.numeric_scale,
          array_remove(array_agg(e.enumlabel), NULL) as postgres_enum_values
        FROM information_schema.columns AS c
        LEFT JOIN pg_type AS t ON c.udt_name = t.typname
        LEFT JOIN pg_enum AS e ON e.enumtypid = t.oid
        WHERE c.table_schema = '${activeConnection.schema}'
        GROUP BY c.table_name, c.column_name, c.ordinal_position, c.column_default, c.is_nullable, c.data_type, c.character_maximum_length, c.numeric_precision, c.numeric_scale
      `,
        `
        SELECT table_name, constraint_name, constraint_type FROM information_schema.table_constraints
        WHERE table_schema = '${activeConnection.schema}'
        AND constraint_type <> 'CHECK'
      `,
        `
        SELECT table_name, view_definition FROM information_schema.views
        WHERE table_schema = '${activeConnection.schema}'
      `,
      ];
    case 'mysql':
      return [
        `
          SELECT TABLE_NAME table_name, TABLE_TYPE table_type FROM information_schema.tables 
          WHERE TABLE_SCHEMA = '${database}'
        `,
        `
          SELECT TABLE_NAME table_name, COLUMN_NAME column_name, ORDINAL_POSITION ordinal_position, COLUMN_DEFAULT column_default, IS_NULLABLE is_nullable, DATA_TYPE data_type, CHARACTER_MAXIMUM_LENGTH character_maximum_length, NUMERIC_PRECISION numeric_precision, NUMERIC_SCALE numeric_scale, COLUMN_TYPE mysql_column_type FROM information_schema.columns
          WHERE TABLE_SCHEMA = '${database}'
        `,
        `
          SELECT TABLE_NAME table_name, CONSTRAINT_NAME constraint_name, CONSTRAINT_TYPE constraint_type FROM information_schema.table_constraints
          WHERE TABLE_SCHEMA = '${database}'
          AND CONSTRAINT_TYPE <> 'CHECK'
        `,
        `
          SELECT TABLE_NAME table_name, VIEW_DEFINITION view_definition FROM information_schema.views
          WHERE TABLE_SCHEMA = '${database}'
        `,
      ];
  }
};
