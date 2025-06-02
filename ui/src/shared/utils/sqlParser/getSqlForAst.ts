import type NodeSqlParser from 'node-sql-parser';

import { getParserOptions, sqlParser } from './utils';
import type { Connection } from '@/types/connection';

export const getSqlForAst = (ast: NodeSqlParser.AST, engine: Connection['engine']) =>
  sqlParser.sqlify(ast, getParserOptions(engine));
