import type { inferProcedureOutput } from '@trpc/server';
import type { AppRouter } from '../../../link/src/main/router';

export type SendQueryResponse = inferProcedureOutput<
  AppRouter['_def']['procedures']['sendQuery']
>[number];

export type Row = {
  [column: string]: SendQueryResponse['rows'][number][string] | undefined;
};

export type Value = Row[string];

export type Column = NonNullable<SendQueryResponse['columns']>[number];

export type DataType = Column['dataType'];

export type Query = {
  id: string;
  showEditor: boolean;
  sql: string | null;
  table: string | null;
};

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
