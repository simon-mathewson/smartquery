import type NodeSqlParser from 'node-sql-parser';
import type { InputMode } from './query/types';
import type { Chart } from '@/savedQueries/types';

export type AddQueryOptions = {
  initialInputMode?: InputMode;
  savedQueryId?: string;
  sql?: string;
  chart?: Chart | null;
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
