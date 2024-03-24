import type { Row, Value } from '~/shared/types';

export type PrimaryKey = { column: string; value: string };

export type CreateLocation = {
  newRowId: string;
  table: string;
  type: 'create';
};

export type UpdateLocation = {
  column: string;
  originalValue: Value;
  primaryKeys: PrimaryKey[];
  table: string;
  type: 'update';
};

export type DeleteLocation = {
  primaryKeys: PrimaryKey[];
  table: string;
  type: 'delete';
};

export type Location = CreateLocation | UpdateLocation | DeleteLocation;

export type CreateChange = {
  location: CreateLocation;
  type: 'create';
  row: Row;
};

export type UpdateChange = {
  location: UpdateLocation;
  type: 'update';
  value: Value;
};

export type DeleteChange = {
  location: DeleteLocation;
  type: 'delete';
};

export type Change = CreateChange | UpdateChange | DeleteChange;

export type AggregatedCreateChanges = {
  location: Pick<CreateLocation, 'table'>;
  rows: Row[];
  type: 'create';
};

export type AggregatedUpdateChanges = {
  location: Pick<UpdateLocation, 'column' | 'table'> & { primaryKeys: PrimaryKey[][] };
  type: 'update';
  value: Value;
};

export type AggregatedDeleteChanges = {
  location: Pick<DeleteLocation, 'table'> & { primaryKeys: PrimaryKey[][] };
  type: 'delete';
};
