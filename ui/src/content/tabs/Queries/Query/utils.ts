import { castArray } from 'lodash';
import NodeSqlParser from 'node-sql-parser';
import type { Connection } from '~/content/connections/types';
import type { Query } from '~/shared/types';

export const getQueryTitle = (query: Query) => query.table ?? 'New query';

export const sqlParser = new NodeSqlParser.Parser();

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgresql: 'postgresql',
    sqlserver: 'transactsql',
  }[engine],
});

export const getParsedQuery = (props: { engine: Connection['engine']; query: Query }) => {
  const { engine, query } = props;

  if (!query.sql) return null;

  try {
    const ast = sqlParser.astify(query.sql, getParserOptions(engine));
    return castArray(ast)[0];
  } catch {
    return null;
  }
};
