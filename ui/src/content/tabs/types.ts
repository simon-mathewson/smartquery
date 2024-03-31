import type NodeSqlParser from 'node-sql-parser';

export type AddQueryOptions = {
  showEditor?: boolean;
  sql?: string;
};

export type FirstSelectStatement = {
  index: number;
  parsed: NodeSqlParser.Select;
  table: string;
};
