import type NodeSqlParser from 'node-sql-parser';
import type { InputMode } from './query/types';
import type { Chart } from '@/savedQueries/types';

export type AddQueryOptions = {
  chart?: Chart | null;
  initialInputMode?: InputMode;
  name?: string;
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
