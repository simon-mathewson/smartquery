import type { Value } from '~/shared/types';
import type { OPERATORS, NULL_OPERATORS, LIST_OPERATORS } from './constants';

export type NullOperator = (typeof NULL_OPERATORS)[number];

export type ListOperator = (typeof LIST_OPERATORS)[number];

export type Operator = (typeof OPERATORS)[number] | NullOperator | ListOperator;

export type OperatorWithValue = Exclude<Operator, NullOperator>;

export type FilterWithValue = {
  column: string;
  operator: OperatorWithValue;
  value: Value;
};

export type FilterWithoutValue = {
  column: string;
  operator: NullOperator;
};

export type Filter = FilterWithValue | FilterWithoutValue;

export type FormFilter = (Omit<FilterWithValue, 'column'> | Omit<FilterWithoutValue, 'column'>) & {
  column: string | null;
};
