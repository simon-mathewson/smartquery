import type NodeSqlParser from 'node-sql-parser';
import type { InputMode } from './query/types';

export type AddQueryOptions = {
  initialInputMode?: InputMode;
  sql?: string;
};

export type Select = {
  database: string;
  parsed: NodeSqlParser.Select;
  schema?: string;
  table: string;
};
