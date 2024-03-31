import type { FirstSelectStatement } from '~/content/tabs/types';
import type { Prisma } from '../../../link/prisma';
import type { DataType } from './dataTypes/types';

export type PrismaValue = string | string[] | number | boolean | Date | Prisma.Decimal | null;

export type Value = string | null | undefined;

export type Row = {
  [column: string]: Value;
};

export type Column = {
  alias?: string;
  dataType: DataType;
  enumValues?: string[] | null;
  isForeignKey?: boolean;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isVisible: boolean;
  name: string;
};

export type Query = {
  id: string;
  firstSelectStatement: FirstSelectStatement | null;
  showEditor: boolean;
  sql: string | null;
  statements: string[] | null;
};

export type QueryResult = {
  columns: Column[] | null;
  rows: Row[];
  table: string;
};

export type Tab = {
  id: string;
  queries: Query[][];
};

export type HtmlRef = React.MutableRefObject<HTMLElement | null>;
