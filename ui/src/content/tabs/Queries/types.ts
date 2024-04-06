import type NodeSqlParser from 'node-sql-parser';

export type AddQueryOptions = {
  showEditor?: boolean;
  sql?: string;
};

export type Select = {
  parsed: NodeSqlParser.Select;
  table: string;
};
