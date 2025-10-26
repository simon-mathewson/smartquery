import type { Engine } from '@/connections/types';
import type { TableExpr } from 'node-sql-parser';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import type { Select } from '../../types';

export const getSql = (props: { engine: Engine; select: Select; table: Select['tables'][0] }) => {
  const { engine, table } = props;

  if (engine === 'sqlite') {
    return getSqlForAst(
      {
        type: 'select',
        columns: [
          { expr: { type: 'column_ref', column: 'cid' } },
          { expr: { type: 'column_ref', column: 'name' } },
          { expr: { type: 'column_ref', column: 'type' } },
          { expr: { type: 'column_ref', column: 'notnull' } },
          { expr: { type: 'column_ref', column: 'pk' } },
        ],
        from: [
          {
            expr: {
              type: 'function',
              name: {
                name: [
                  {
                    type: 'default',
                    value: 'pragma_table_info',
                  },
                ],
              },
              args: {
                type: 'expr_list',
                value: [
                  {
                    type: 'single_quote_string',
                    value: table.originalName,
                  },
                ],
              },
            },
            as: null,
          } as unknown as TableExpr,
        ],
        orderby: [{ expr: { type: 'column_ref', column: 'cid' }, type: 'ASC' }],
        with: null,
        options: null,
        distinct: null,
        where: null,
        groupby: {
          columns: null,
          modifiers: [],
        },
        having: null,
        limit: null,
      },
      { engine },
    );
  }

  if (engine === 'mysql') {
    return getSqlForAst(
      {
        with: null,
        type: 'select',
        options: null,
        distinct: null,
        columns: [
          // Aliases are used because MySQL might return column names as uppercase, but we want
          // lowercase.
          {
            expr: { type: 'column_ref', table: null, column: 'ordinal_position' },
            as: 'ordinal_position',
          },
          { expr: { type: 'column_ref', table: null, column: 'column_name' }, as: 'column_name' },
          { expr: { type: 'column_ref', table: null, column: 'data_type' }, as: 'data_type' },
          { expr: { type: 'column_ref', table: null, column: 'is_nullable' }, as: 'is_nullable' },
          { expr: { type: 'column_ref', table: null, column: 'column_type' }, as: 'column_type' },
        ],
        from: [{ db: 'information_schema', table: 'columns', as: null }],
        where: {
          type: 'binary_expr',
          operator: 'AND',
          left: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: null, column: 'table_name' },
            right: { type: 'single_quote_string', value: table.originalName },
          },
          right: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: null, column: 'table_schema' },
            right: { type: 'single_quote_string', value: table.schema },
          },
        },
        groupby: {
          columns: null,
          modifiers: [],
        },
        having: null,
        orderby: [
          { expr: { type: 'column_ref', table: null, column: 'ordinal_position' }, type: 'ASC' },
        ],
        limit: null,
      },
      { engine },
    );
  }

  return getSqlForAst(
    {
      with: null,
      type: 'select',
      options: null,
      distinct: null,
      columns: [
        {
          expr: { type: 'column_ref', table: null, column: 'ordinal_position' },
          as: 'ordinal_position',
        },
        { expr: { type: 'column_ref', table: null, column: 'column_name' }, as: null },
        { expr: { type: 'column_ref', table: null, column: 'data_type' }, as: null },
        { expr: { type: 'column_ref', table: null, column: 'is_nullable' }, as: null },
      ],
      from: [{ db: 'information_schema', table: 'columns', as: null }],
      where: {
        type: 'binary_expr',
        operator: 'AND',
        left: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'column_ref', table: null, column: 'table_name' },
          right: { type: 'single_quote_string', value: table.originalName },
        },
        right: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'column_ref', table: null, column: 'table_schema' },
          right: { type: 'single_quote_string', value: table.schema },
        },
      },
      groupby: {
        columns: null,
        modifiers: [],
      },
      having: null,
      orderby: [
        { expr: { type: 'column_ref', table: null, column: 'ordinal_position' }, type: 'ASC' },
      ],
      limit: null,
    },
    { engine },
  );
};
