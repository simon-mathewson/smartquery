import type NodeSqlParser from 'node-sql-parser';
import type { InputMode } from './query/types';

export type AddQueryOptions = {
  initialInputMode?: InputMode;
  savedQueryId?: string;
  sql?: string;
};

export type Select = {
  database: string;
  parsed: NodeSqlParser.Select;
  schema?: string;
  tables: {
    name: string;
    originalName: string;
  }[];
};
