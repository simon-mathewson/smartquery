import type { Value } from '~/shared/types';

export type PrimaryKey = { column: string; value: string };

export type UpdateLocation = {
  column: string;
  originalValue: Value;
  primaryKeys: PrimaryKey[];
  table: string;
};

export type DeleteLocation = {
  primaryKeys: PrimaryKey[];
  table: string;
};

export type Change =
  | {
      location: UpdateLocation;
      type: 'update';
      value: Value;
    }
  | {
      location: DeleteLocation;
      type: 'delete';
    };
