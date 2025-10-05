import type { SORT_DIRECTIONS } from './constants';

export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export type SortedColumn = {
  columnName: string;
  direction: SortDirection;
};
