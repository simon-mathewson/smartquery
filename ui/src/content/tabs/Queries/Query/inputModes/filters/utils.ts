import type NodeSqlParser from 'node-sql-parser';
import type { Column } from '~/shared/types';
import type { Filter, FilterWithValue, Operator } from './types';
import { isNotNull } from '~/shared/utils/typescript';
import { LIST_OPERATORS, NULL_OPERATORS, OPERATORS } from './constants';
import { includes } from 'lodash';
import { assert } from 'ts-essentials';

export const getAstOperator = (operator: Operator, filter: Filter): string => {
  if (operator === 'IS NULL' || (operator === '=' && 'value' in filter && filter.value === null)) {
    return 'IS';
  }

  if (
    operator === 'IS NOT NULL' ||
    (operator === '!=' && 'value' in filter && filter.value === null)
  ) {
    return 'IS NOT';
  }

  return operator;
};

export const getWhereAst = (props: { columns: Column[]; filters: Filter[] }) => {
  const { columns, filters } = props;

  return filters
    .map((filter) => {
      const column = columns.find((column) => column.name === filter.column);
      return !column || !column.isVisible ? null : filter;
    })
    .filter(isNotNull)
    .reduce<NodeSqlParser.Expr | null>((all, filter) => {
      const valueExpression = (() => {
        if (includes(NULL_OPERATORS, filter.operator)) {
          return {
            type: 'null',
            value: null,
          };
        }

        if (includes(LIST_OPERATORS, filter.operator)) {
          return {
            type: 'expr_list',
            value:
              (filter as FilterWithValue).value?.split(',').map((value) => ({
                type: 'single_quote_string',
                value: value.trim(),
              })) ?? [],
          };
        }

        assert('value' in filter);

        if (filter.value === null) {
          return {
            type: 'null',
            value: null,
          };
        }

        return {
          type: 'single_quote_string',
          value: filter.value,
        };
      })();

      const filterExpression: NodeSqlParser.Expr = {
        type: 'binary_expr',
        operator: getAstOperator(filter.operator, filter),
        left: {
          type: 'column_ref',
          table: null,
          column: filter.column,
        },
        right: valueExpression,
      };

      if (all?.type === 'binary_expr') {
        return {
          type: 'binary_expr',
          operator: 'AND',
          left: all,
          right: filterExpression,
        };
      }

      return filterExpression;
    }, null);
};

export const getFilter = (
  expression: Extract<NodeSqlParser.Expr, { operator: string }>,
): Filter => {
  const { operator } = expression;

  if (
    (expression.left.type !== 'column_ref' && expression.left.type !== 'double_quote_string') ||
    expression.right.type === 'param' ||
    expression.right.type === 'column_ref' ||
    !includes(OPERATORS, operator)
  ) {
    throw new Error('Unsupported filter');
  }

  const left = expression.left as NodeSqlParser.ColumnRef | NodeSqlParser.Value;
  const column = 'column' in left ? left.column : (left.value as string);

  const right = expression.right as NodeSqlParser.Value;

  if (operator === 'IS') {
    if (right.type !== 'null' || right.value !== null) {
      throw new Error('Unsupported filter');
    }

    return { column, operator: 'IS NULL' };
  }

  if (operator === 'IS NOT') {
    if (right.type !== 'null' || right.value !== null) {
      throw new Error('Unsupported filter');
    }

    return { column, operator: 'IS NOT NULL' };
  }

  if (operator === 'IN' || operator === 'NOT IN') {
    if (right.type !== 'expr_list') {
      throw new Error('Unsupported filter');
    }

    const values = right.value.map((value: { type: string; value: string | number }) => {
      if (value.type !== 'single_quote_string') {
        throw new Error('Unsupported filter');
      }

      return `'${value.value as string}'`;
    });

    return {
      column,
      operator,
      value: `${values.join(', ')}`,
    };
  }

  if (right.type !== 'single_quote_string') {
    throw new Error('Unsupported filter');
  }

  return {
    column,
    operator: operator as Operator,
    value: String(right.value),
  };
};

export const getFilters = (where: NodeSqlParser.Expr): Filter[] => {
  if (where.type !== 'binary_expr') {
    throw new Error('Unsupported filter');
  }

  if (where.operator === 'AND') {
    const left = where.left as NodeSqlParser.Expr;
    const right = where.right as NodeSqlParser.Expr;

    return [...getFilters(left), ...getFilters(right)];
  }

  return [getFilter(where)];
};
