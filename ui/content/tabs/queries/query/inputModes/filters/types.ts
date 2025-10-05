import type { Value } from '~/shared/types';
import type { NULL_OPERATORS, OPERATORS } from './constants';
import type { ColumnRef } from '../../../utils/columnRefs';

export type NullOperator = (typeof NULL_OPERATORS)[number];

export type Operator = (typeof OPERATORS)[number] | NullOperator;

export type OperatorWithValue = Exclude<Operator, NullOperator>;

export type LogicalOperator = 'AND' | 'OR';

export type FilterWithoutValue = {
  columnRef: ColumnRef;
  logicalOperator: LogicalOperator;
  operator: NullOperator;
};

export type FilterWithValue = Omit<FilterWithoutValue, 'operator'> & {
  operator: OperatorWithValue;
  value: Value;
};

export type Filter = FilterWithValue | FilterWithoutValue;

export type FormFilter = (
  | Omit<FilterWithValue, 'columnRef'>
  | Omit<FilterWithoutValue, 'columnRef'>
) & {
  columnRef: ColumnRef | null;
};
