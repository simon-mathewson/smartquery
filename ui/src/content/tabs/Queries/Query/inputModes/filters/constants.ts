export const NULL_OPERATORS = ['IS NULL', 'IS NOT NULL'] as const;

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
] as const;
