import type { inferProcedureOutput } from '@trpc/server';
import type { AppRouter } from '../../../../link/src/main/router';

export type SendQueryResponse = inferProcedureOutput<
  AppRouter['_def']['procedures']['sendQuery']
>[number];

export type Row = SendQueryResponse['rows'][number];

export type Value = Row[string];

export type Column = NonNullable<SendQueryResponse['columns']>[number];

export type DataType = Column['dataType'];

export type Query = {
  columns: Column[] | null;
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
