import type { Connection } from '~/shared/types';
import { castArray } from 'lodash';
import { getParserOptions, sqlParser } from './utils';

export const getAstForSql = (props: { engine: Connection['engine']; statement: string }) => {
  const { engine, statement } = props;

  try {
    const ast = sqlParser.astify(statement, getParserOptions(engine));
    return castArray(ast)[0];
  } catch {
    return null;
  }
};
