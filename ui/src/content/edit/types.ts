import { Value } from '../queries/types';

export type PrimaryKey = { column: string; value: string | number };

export type ChangeRow = {
  primaryKeys: PrimaryKey[];
};

export type Change = {
  column: string;
  rows: ChangeRow[];
  table: string;
  value: Value;
};
