import type NodeSqlParser from 'node-sql-parser';

import { getParserOptions, getSqlParser } from './utils';
import type { Connection } from '@/connections/types';
import { formatSql } from '../sql/sql';

export const getSqlForAst = async (
  ast: NodeSqlParser.AST,
  options: { engine: Connection['engine']; skipFormat?: boolean },
) => {
  const { engine, skipFormat } = options;

  const sqlParser = await getSqlParser();
  const sql = sqlParser.sqlify(ast, getParserOptions(engine));

  return skipFormat ? sql : await formatSql(sql, engine);
};
