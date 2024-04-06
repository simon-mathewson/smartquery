import type { Value } from '~/shared/types';
import type { OPERATORS, NULL_OPERATORS } from './constants';

export type NullOperator = (typeof NULL_OPERATORS)[number];

export type Operator = (typeof OPERATORS)[number] | NullOperator;

export type OperatorWithValue = Exclude<Operator, NullOperator>;

export type LogicalOperator = 'AND' | 'OR';

export type FilterWithoutValue = {
  column: string;
  logicalOperator: LogicalOperator;
  operator: NullOperator;
};

export type FilterWithValue = Omit<FilterWithoutValue, 'operator'> & {
  operator: OperatorWithValue;
  value: Value;
};

export type Filter = FilterWithValue | FilterWithoutValue;

export type FormFilter = (Omit<FilterWithValue, 'column'> | Omit<FilterWithoutValue, 'column'>) & {
  column: string | null;
};
