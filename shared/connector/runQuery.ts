import type { RowDataPacket } from 'mysql2';
import type { Connector, DbValue } from './types';

export type Results = Array<Array<Record<string, DbValue>>>;

export const runQuery = async (connector: Connector, statements: string[]): Promise<Results> => {
  if ('mysqlPool' in connector) {
    const client = await connector.mysqlPool.getConnection();

    try {
      await client.query('START TRANSACTION');

      const results = await Promise.all(statements.map((statement) => client.query(statement)));

      await client.query('COMMIT');

      return results.map(([rows]) => (Array.isArray(rows) ? (rows as RowDataPacket[]) : []));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
