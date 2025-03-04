import type { QueryExecResult, SqlValue } from 'sql.js';

export const convertSqliteResultsToRecords = (results: QueryExecResult[]) => {
  return results.map((statementResult) => {
    return statementResult.values.map((valueRow) => {
      return statementResult.columns.reduce(
        (acc, column, index) => {
          acc[column] = valueRow[index];
          return acc;
        },
        {} as Record<string, SqlValue>,
      );
    });
  });
};
