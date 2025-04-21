import type { Select } from '~/content/tabs/queries/types';
import type { Prisma } from '../../../link/prisma';
import type { DataType } from './dataTypes/types';
import { z } from 'zod';
import type { inferRouterInputs } from '@trpc/server';
import type { router } from '../../../link/src/main/router/router';
import type { Database as SqliteDatabase, SqlValue as SqliteValue } from 'sql.js';
import type { InputMode } from '~/content/tabs/queries/query/types';

export type ConnectInput = inferRouterInputs<typeof router>['connectDb'];

export const baseConnectionSchema = z.object({
  database: z.string().trim().min(1),
  id: z.string().min(1),
  name: z.string().trim().min(1),
});

export const remoteConnectionSchema = baseConnectionSchema.extend({
  credentialStorage: z.union([z.literal('alwaysAsk'), z.literal('localStorage')]),
  engine: z.union([z.literal('mysql'), z.literal('postgresql')]),
  host: z.string().trim().min(1),
  password: z.string().nullable(),
  port: z.number(),
  schema: z.string().trim().min(1).optional(),
  ssh: z
    .object({
      credentialStorage: z.union([z.literal('alwaysAsk'), z.literal('localStorage')]),
      host: z.string().trim().min(1),
      password: z.string().nullable().optional(),
      port: z.number(),
      privateKey: z.string().nullable().optional(),
      user: z.string().trim().min(1),
    })
    .nullable(),
  type: z.literal('remote'),
  user: z.string().trim().min(1),
});

export type RemoteConnection = z.infer<typeof remoteConnectionSchema>;

export const fileConnectionSchema = baseConnectionSchema.extend({
  engine: z.literal('sqlite'),
  type: z.literal('file'),
});

export type FileConnection = z.infer<typeof fileConnectionSchema>;

export { SqliteDatabase };

export const connectionSchema = z.discriminatedUnion('type', [
  remoteConnectionSchema,
  fileConnectionSchema,
]);

export type Connection = z.infer<typeof connectionSchema>;

export type Engine = Connection['engine'];

export type ActiveConnection =
  | (RemoteConnection & { clientId: string })
  | (FileConnection & { sqliteDb: SqliteDatabase });

export type Database = {
  name: string;
  schemas: string[];
};

export type PrismaValue = string | string[] | number | boolean | Date | Prisma.Decimal | null;

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
  name: string;
};

export type Query = {
  id: string;
  initialInputMode?: InputMode;
  isLoading: boolean;
  select: Select | null;
  sql: string | null;
  statements: string[] | null;
};

export type TableType = 'BASE TABLE' | 'SYSTEM_VIEW' | 'VIEW';

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
  schema?: string;
  table?: string;
  tableType: TableType | null;
  totalRows?: number;
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
