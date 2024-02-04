export type PrimaryKey = { column: string; value: string | number };

export type ChangeRow = {
  primaryKeys: PrimaryKey[];
};

export type ChangeLocation = {
  column: string;
  rows: ChangeRow[];
  table: string;
};

export type Value = string | number | boolean | null;

export type Change = {
  location: ChangeLocation;
  value: Value;
};
