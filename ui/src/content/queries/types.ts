import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '../../../../link/src/main/router';

const dataTypes = [
  'bigint',
  'boolean',
  'char',
  'character varying',
  'datetime',
  'decimal',
  'enum',
  'int',
  'integer',
  'json',
  'time with time zone',
  'time without time zone',
  'time',
  'timestamp with time zone',
  'timestamp without time zone',
  'timestamp',
  'tinyint',
  'user-defined',
  'varchar',
] as const;

export type DataType = (typeof dataTypes)[number];

export type Column = {
  dataType?: DataType;
  isForeignKey?: boolean;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  name: string;
};

export type Value = inferProcedureOutput<
  AppRouter['_def']['procedures']['sendQuery']
>[number][number][string];

export type Query = {
  columns: Column[];
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
