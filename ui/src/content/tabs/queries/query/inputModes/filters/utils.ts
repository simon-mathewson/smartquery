import type NodeSqlParser from 'node-sql-parser';
import type { Column } from '~/shared/types';
import type { Filter, LogicalOperator, Operator } from './types';
import { LOGICAL_OPERATORS, NULL_OPERATORS, OPERATORS } from './constants';
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

export const getAstFromFilters = (props: { columns: Column[]; filters: Filter[] }) => {
  const { columns, filters } = props;

  return filters.reduce<NodeSqlParser.Expr | null>((all, filter) => {
    const column = columns.find((column) => column.name === filter.column);

    if (!column || !column.isVisible) {
      return all;
    }

    const valueExpression = (() => {
      if (includes(NULL_OPERATORS, filter.operator)) {
        return {
          type: 'null',
          value: null,
        };
      }

      assert('value' in filter);

      if (filter.value === null) {
        return {
          type: 'null',
          value: null,
        };
      }

      if (column.dataType === 'boolean') {
        return {
          type: 'bool',
          value: filter.value.toLowerCase() === 'true',
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
        operator: filter.logicalOperator,
        left: all,
        right: filterExpression,
      };
    }

    return filterExpression;
  }, null);
};

export const getFilterFromAst = (
  expression: Extract<NodeSqlParser.Expr, { operator: string }>,
  logicalOperator: LogicalOperator,
): Filter => {
  const { operator } = expression;

  if (expression.left.type !== 'column_ref' && expression.left.type !== 'double_quote_string') {
    throw new Error(`Left expression is not column: ${JSON.stringify(expression.left)}`);
  }
  if (expression.right.type === 'param' || expression.right.type === 'column_ref') {
    throw new Error(`Right expression is not value: ${JSON.stringify(expression.right)}`);
  }
  if (!includes(OPERATORS, operator)) {
    throw new Error(`Operator is not supported: ${JSON.stringify(operator)}`);
  }

  const left = expression.left as NodeSqlParser.ColumnRef | NodeSqlParser.Value;
  const column = 'column' in left ? left.column : (left.value as string);

  const right = expression.right as NodeSqlParser.Value;

  if (operator === 'IS') {
    if (right.type !== 'null' || right.value !== null) {
      throw new Error(`IS operator used with non-null value: ${JSON.stringify(right)}`);
    }

    return { column, logicalOperator, operator: 'IS NULL' };
  }

  if (operator === 'IS NOT') {
    if (right.type !== 'null' || right.value !== null) {
      throw new Error(`IS NOT operator used with non-null value: ${JSON.stringify(right)}`);
    }

    return { column, logicalOperator, operator: 'IS NOT NULL' };
  }
  if (!includes(['single_quote_string', 'bool', 'number'], right.type)) {
    throw new Error(
      `Right expression is not single_quote_string or bool or number: ${JSON.stringify(right)}`,
    );
  }

  return {
    column,
    logicalOperator,
    operator: operator as Operator,
    value: String(right.value),
  };
};

export const getFiltersFromAst = (
  where: NodeSqlParser.Expr,
  parentLogicalOperator: LogicalOperator = 'AND',
): Filter[] => {
  if (where.type !== 'binary_expr') {
    throw new Error('Filter is not a binary_expr');
  }

  if (includes(LOGICAL_OPERATORS, where.operator)) {
    const logicalOperator = where.operator as LogicalOperator;
    const left = where.left as NodeSqlParser.Expr;
    const right = where.right as NodeSqlParser.Expr;

    return [
      ...getFiltersFromAst(left, logicalOperator),
      ...getFiltersFromAst(right, logicalOperator),
    ];
  }

  return [getFilterFromAst(where, parentLogicalOperator)];
};
