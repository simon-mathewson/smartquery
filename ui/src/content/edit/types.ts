import type { Value } from '~/shared/types';

export type PrimaryKey = { column: string; value: string };

export type CreateLocation = {
  column: string;
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
  value: Value;
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

export type AggregatedCreateChanges = { type: 'create' } & {
  location: Pick<CreateLocation, 'table'>;
  newValues: Array<{ column: string; rowId: string; value: Value }>;
};

export type AggregatedUpdateChanges = { type: 'update'; value: Value } & {
  location: Pick<UpdateLocation, 'column' | 'table'> & { primaryKeys: PrimaryKey[][] };
};

export type AggregatedDeleteChanges = { type: 'delete' } & {
  location: Pick<DeleteLocation, 'table'> & { primaryKeys: PrimaryKey[][] };
};
