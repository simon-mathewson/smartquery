import type NodeSqlParser from 'node-sql-parser';
import type { Column } from '~/shared/types';
import type { Filter, Operator } from './types';
import { isNotNull } from '~/shared/utils/typescript';
import type { ColumnRef } from 'node-sql-parser';
import { LIST_OPERATORS, NULL_OPERATORS, OPERATORS } from './constants';
import { includes } from 'lodash';
import { assert } from 'ts-essentials';

export const getAstOperator = (operator: Operator): string => {
  if (operator === 'IS NULL') {
    return 'IS';
  }

  if (operator === 'IS NOT NULL') {
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
            value: (filter as Extract<Filter, { value: string }>).value.split(',').map((value) => ({
              type: 'single_quote_string',
              value: value.trim(),
            })),
          };
        }

        assert('value' in filter);

        return {
          type: 'single_quote_string',
          value: filter.value,
        };
      })();

      const filterExpression: NodeSqlParser.Expr = {
        type: 'binary_expr',
        operator: getAstOperator(filter.operator),
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

export const getFilter = (expression: NodeSqlParser.Expr): Filter => {
  if (
    expression.type !== 'binary_expr' ||
    expression.operator !== 'AND' ||
    expression.right.type !== 'binary_expr'
  ) {
    throw new Error('Unsupported filter');
  }

  const filterExpression = expression.right as NodeSqlParser.Expr;

  if (
    filterExpression.left.type !== 'column_ref' ||
    !includes(OPERATORS, filterExpression.operator)
  ) {
    throw new Error('Unsupported filter');
  }

  const { column } = filterExpression.left as ColumnRef;
  const operator = filterExpression.operator;
  const valueExpression = filterExpression.right;

  if (operator === 'IS') {
    if (valueExpression.type !== 'null' || valueExpression.value !== null) {
      throw new Error('Unsupported filter');
    }

    return {
      column,
      operator: 'IS NULL',
    };
  }

  if (operator === 'IS NOT') {
    if (valueExpression.type !== 'null' || valueExpression.value !== null) {
      throw new Error('Unsupported filter');
    }

    return {
      column,
      operator: 'IS NOT NULL',
    };
  }

  if (operator === 'IN' || operator === 'NOT IN') {
    if (valueExpression.type !== 'expr_list') {
      throw new Error('Unsupported filter');
    }

    const values = valueExpression.value.map((value: { type: string; value: string | number }) => {
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

  if (valueExpression.type !== 'single_quote_string') {
    throw new Error('Unsupported filter');
  }

  return {
    column,
    operator: operator as Operator,
    value: valueExpression.value as string,
  };
};

export const getFilters = (where: NodeSqlParser.Expr): Filter[] => {
  if (
    where.type !== 'binary_expr' ||
    where.operator !== 'AND' ||
    where.right.type !== 'binary_expr' ||
    !('left' in where.right) ||
    where.right.left.type !== 'column_ref' ||
    !includes(OPERATORS, where.right.operator)
  ) {
    throw new Error('Unsupported filter');
  }

  return [getFilter(where.right), ...getFilters(where.left as NodeSqlParser.Expr)];
};
