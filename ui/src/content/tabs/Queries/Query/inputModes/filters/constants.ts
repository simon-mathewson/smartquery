export const NULL_OPERATORS = ['IS NULL', 'IS NOT NULL'] as const;

export const LIST_OPERATORS = ['IN', 'NOT IN'] as const;

export const OPERATORS = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'LIKE',
  'NOT LIKE',
  ...NULL_OPERATORS,
  ...LIST_OPERATORS,
] as const;
