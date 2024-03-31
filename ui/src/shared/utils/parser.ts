import NodeSqlParser from 'node-sql-parser';
import type { Connection } from '~/shared/types';
import { castArray } from 'lodash';

export const sqlParser = new NodeSqlParser.Parser();

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgresql: 'postgresql',
  }[engine],
});

export const getParsedStatement = (props: { engine: Connection['engine']; statement: string }) => {
  const { engine, statement } = props;

  try {
    const ast = sqlParser.astify(statement, getParserOptions(engine));
    return castArray(ast)[0];
  } catch {
    return null;
  }
};
