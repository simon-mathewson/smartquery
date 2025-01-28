import type { Select } from '~/content/tabs/queries/types';
import type { Prisma } from '../../../link/prisma';
import type { DataType } from './dataTypes/types';
import { z } from 'zod';
import type { inferRouterInputs } from '@trpc/server';
import type { router } from '../../../link/src/main/router/router';

export type ConnectInput = inferRouterInputs<typeof router>['connectDb'];

export const connectionSchema = z.object({
  credentialStorage: z.union([z.literal('alwaysAsk'), z.literal('localStorage')]),
  database: z.string().trim().min(1),
  engine: z.union([z.literal('mysql'), z.literal('postgresql')]),
  host: z.string().trim().min(1),
  id: z.string(),
  name: z.string().trim().min(1),
  password: z.string().nullable(),
  port: z.number(),
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
  user: z.string().trim().min(1),
});

export type Connection = z.infer<typeof connectionSchema>;

export type Engine = Connection['engine'];

export type ActiveConnection = Connection & {
  clientId: string;
};

export type PrismaValue = string | string[] | number | boolean | Date | Prisma.Decimal | null;

export type Value = string | null;

export type Row = {
  [column: string]: Value;
};

export type Column = {
  dataType: DataType;
  enumValues?: string[] | null;
  isForeignKey?: boolean;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isVisible: boolean;
  name: string;
};

export type Query = {
  id: string;
  isLoading: boolean;
  select: Select | null;
  showEditor: boolean;
  sql: string | null;
  statements: string[] | null;
};

export type TableType = 'BASE TABLE' | 'SYSTEM_VIEW' | 'VIEW';

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
  table?: string;
  tableType: TableType | null;
  totalRows?: number;
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
