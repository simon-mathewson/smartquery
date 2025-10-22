import type { Connector } from './types';
import type { PrismaValue } from '@/prisma/types';

export type Results = Array<Array<Record<string, PrismaValue>>>;

export const runQuery = async (connector: Connector, statements: string[]): Promise<Results> => {
  if ('mysqlClient' in connector) {
    return connector.mysqlClient.$transaction(
      statements.map((statement) =>
        connector.mysqlClient.$queryRawUnsafe<Array<Record<string, PrismaValue>>>(statement),
      ),
    );
  }

  if ('postgresPool' in connector) {
    const client = await connector.postgresPool.connect();

    try {
      await client.query('BEGIN');

      const results = await Promise.all(statements.map((statement) => client.query(statement)));

      await client.query('COMMIT');

      return results.map((result) => result.rows);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  throw new Error('Unsupported connector type');
};
