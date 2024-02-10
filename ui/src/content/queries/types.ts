import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '../../../../link/src/main/router';

export type Column = {
  isForeignKey?: boolean;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  name: string;
};

export type Value = inferProcedureOutput<
  AppRouter['_def']['procedures']['sendQuery']
>[number][number][string];

export type Query = {
  columns: Column[];
  hasResults: boolean;
  id: string;
  rows: Array<Record<string, Value>>;
  showEditor: boolean;
  sql: string | null;
  table: string | null;
};

export type QueryToAdd = {
  sql?: string;
  showEditor?: boolean;
  table?: string;
};

export type QueriesState = {
  queries: Query[][];
};
