import type { Select } from '~/content/tabs/queries/types';
import type { DataType } from './dataTypes/types';
import type { inferRouterInputs } from '@trpc/server';
import type { router } from '../../../link/src/main/router/router';
import type { Database as SqliteDatabase, SqlValue as SqliteValue } from 'sql.js';
import type { InputMode } from '~/content/tabs/queries/query/types';
import type { FileConnection, RemoteConnection } from '@/connections/types';
import type { PrismaValue } from '@/prisma/types';
import type { Chart } from '@/savedQueries/types';

export type ConnectInput = inferRouterInputs<typeof router>['connectDb'];

export { SqliteDatabase };

export type ActiveConnection =
  | (RemoteConnection & { connectedViaCloud: boolean; connectorId: string })
  | (FileConnection & { sqliteDb: SqliteDatabase });

export type Database = {
  name: string;
  schemas: string[];
};

export type DbValue = SqliteValue | PrismaValue;

export type Value = string | null;

export type Row = {
  [column: string]: Value;
};

export type Column = {
  dataType: DataType;
  enumValues?: string[] | null;
  foreignKey: {
    schema?: string;
    table: string;
    column: string;
  } | null;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isVisible: boolean;
  isUnique?: boolean;
  name: string;
  originalName: string;
  table?: { name: string; originalName: string } | null;
};

export type Query = {
  chart?: Chart | null;
  id: string;
  initialInputMode?: InputMode;
  isLoading: boolean;
  savedQueryId?: string | null;
  select: Select | null;
  sql: string | null;
  statements: string[] | null;
};

export type TableType = 'BASE TABLE' | 'SYSTEM_VIEW' | 'VIEW';

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
  schema?: string;
  tables: {
    name: string;
    originalName: string;
    type: TableType | null;
  }[];
  totalRows?: number;
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
