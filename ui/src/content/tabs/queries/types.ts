import type NodeSqlParser from 'node-sql-parser';

export type AddQueryOptions = {
  showEditor?: boolean;
  sql?: string;
};

export type Select = {
  database: string;
  parsed: NodeSqlParser.Select;
  schema?: string;
  table: string;
};
