import type { Connection } from '@/connections/types';
import { castArray } from 'lodash';
import { getParserOptions, getSqlParser } from './utils';

export const getAstForSql = async (props: {
  engine: Connection['engine'];
  skipLogging?: boolean;
  statement: string;
}) => {
  const { engine, statement, skipLogging } = props;

  try {
    const sqlParser = await getSqlParser();
    const ast = sqlParser.astify(statement, getParserOptions(engine));
    return castArray(ast)[0];
  } catch (error) {
    if (!skipLogging) {
      console.error(error);
    }
    return null;
  }
};
