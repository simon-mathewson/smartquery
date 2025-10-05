import type { DbValue } from '~/shared/types';

export type SqliteSchemaDefinitions = {
  createdAt: Date;
  definitions: {
    tables: { name: string }[];
  };
};

export type RemoteSchemaDefinitions = {
  createdAt: Date;
  definitions: {
    tables: {
      table_name: string;
      columns: { column_name: string }[];
      tableConstraints: Pick<Record<string, DbValue>, string>[];
    }[];
    views: Record<string, DbValue>[];
  };
};

export type SchemaDefinitions = SqliteSchemaDefinitions | RemoteSchemaDefinitions;
