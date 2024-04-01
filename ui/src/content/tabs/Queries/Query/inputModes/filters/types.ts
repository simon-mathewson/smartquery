import type { OPERATORS, NULL_OPERATORS, LIST_OPERATORS } from './constants';

export type NullOperator = (typeof NULL_OPERATORS)[number];

export type ListOperator = (typeof LIST_OPERATORS)[number];

export type Operator = (typeof OPERATORS)[number] | NullOperator | ListOperator;

export type OperatorWithValue = Exclude<Operator, NullOperator>;

export type Filter =
  | {
      column: string;
      operator: OperatorWithValue;
      value: string;
    }
  | {
      column: string;
      operator: NullOperator;
    };
