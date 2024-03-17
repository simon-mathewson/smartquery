import type NodeSqlParser from 'node-sql-parser';
import type { Connection } from '~/content/connections/types';
import type { Column } from '~/shared/types';

export const getWhere = (props: {
  columns: Column[];
  engine: Connection['engine'];
  searchValue: string;
}) => {
  const { columns, engine, searchValue } = props;

  return columns
    .filter(({ isVisible }) => isVisible)
    .reduce<NodeSqlParser.Expr | null>((all, column) => {
      const newExpr: NodeSqlParser.Expr = {
        type: 'binary_expr',
        operator: 'LIKE',
        left:
          engine === 'postgresql'
            ? ({
                type: 'function',
                name: 'LOWER',
                args: {
                  type: 'expr_list',
                  value: [
                    {
                      type: 'cast',
                      keyword: 'cast',
                      expr: { type: 'double_quote_string', value: column.name },
                      symbol: '::',
                      target: { dataType: 'TEXT' },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any,
                  ],
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
            : {
                type: 'column_ref',
                table: null,
                column: column.alias ?? column.name,
              },
        right:
          engine === 'postgresql'
            ? ({
                type: 'function',
                name: 'LOWER',
                args: {
                  type: 'expr_list',
                  value: [
                    {
                      type: 'single_quote_string',
                      value: `%${searchValue}%`,
                    },
                  ],
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
            : {
                type: 'single_quote_string',
                value: `%${searchValue}%`,
              },
      };

      if (all?.type === 'binary_expr') {
        return {
          type: 'binary_expr',
          operator: 'OR',
          left: all,
          right: newExpr,
        };
      }

      return newExpr;
    }, null);
};
