import type { DbValue } from '@/connector/types';

export type UniqueValue = { column: string; value: string };

export type CreateLocation = {
  index: number;
  table: string;
  type: 'create';
};

export type UpdateLocation = {
  column: string;
  originalValue: DbValue;
  uniqueValues: UniqueValue[];
  table: string;
  type: 'update';
};

export type DeleteLocation = {
  uniqueValues: UniqueValue[];
  table: string;
  type: 'delete';
};

export type Location = CreateLocation | UpdateLocation | DeleteLocation;

export type CreateValue = DbValue | undefined;

export type CreateRow = {
  [column: string]: CreateValue;
};

export type CreateChange = {
  location: CreateLocation;
  type: 'create';
  row: CreateRow;
};

export type CreateChangeInput = Omit<CreateChange, 'location'> & {
  location: Omit<CreateLocation, 'index'> & { index?: number };
};

export type UpdateChange = {
  location: UpdateLocation;
  type: 'update';
  value: DbValue;
};

export type DeleteChange = {
  location: DeleteLocation;
  type: 'delete';
};

export type Change = CreateChange | UpdateChange | DeleteChange;

export type AggregatedCreateChanges = {
  location: Pick<CreateLocation, 'table'>;
  rows: CreateRow[];
};

export type AggregatedUpdateChanges = {
  location: Pick<UpdateLocation, 'column' | 'table'> & { uniqueValues: UniqueValue[][] };
  value: DbValue;
};

export type AggregatedDeleteChanges = {
  location: Pick<DeleteLocation, 'table'> & { uniqueValues: UniqueValue[][] };
};
