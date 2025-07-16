import type NodeSqlParser from 'node-sql-parser';

import { getParserOptions, getSqlParser } from './utils';
import type { Connection } from '@/types/connection';

export const getSqlForAst = async (ast: NodeSqlParser.AST, engine: Connection['engine']) => {
  const sqlParser = await getSqlParser();
  return sqlParser.sqlify(ast, getParserOptions(engine));
};
