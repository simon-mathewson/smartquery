import type NodeSqlParser from 'node-sql-parser';

export type AddQueryOptions = {
  showEditor?: boolean;
  sql?: string;
};

export type Select = {
  /**
   * Postgres: Database
   * MySQL: Constant value 'def'
   */
  catalog: string;

  parsed: NodeSqlParser.Select;

  /**
   * Postgres: Schema
   * MySQL: Database
   */
  schema: string;

  table: string;
};
