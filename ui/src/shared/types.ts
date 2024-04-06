import type { Select } from '~/content/tabs/Queries/types';
import type { Prisma } from '../../../link/prisma';
import type { DataType } from './dataTypes/types';
import type { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '../../../link/src/main/router';

export type Connection = inferRouterInputs<AppRouter>['connectDb'];

export type ActiveConnection = Connection & {
  clientId: string;
};

export type PrismaValue = string | string[] | number | boolean | Date | Prisma.Decimal | null;

export type Value = string | null;

export type Row = {
  [column: string]: Value;
};

export type Column = {
  alias?: string;
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
  select: Select | null;
  showEditor: boolean;
  sql: string | null;
  statements: string[] | null;
};

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
  table?: string;
  totalRows?: number;
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
