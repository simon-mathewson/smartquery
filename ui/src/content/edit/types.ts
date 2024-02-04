import { Value } from '../queries/types';

export type PrimaryKey = { column: string; value: string | number };

export type ChangeRow = {
  primaryKeys: PrimaryKey[];
  value: Value;
};

export type ChangeLocation = {
  column: string;
  row: ChangeRow;
  table: string;
};

export type Change = {
  location: ChangeLocation;
  value: Value;
};
