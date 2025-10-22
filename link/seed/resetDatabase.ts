import type { RemoteConnection } from '@/connections/types';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';

export const resetDatabase = async (connection: RemoteConnection, defaultDatabase: string) => {
  const { database } = connection;

  const connector = await connect({ ...connection, database: defaultDatabase });

  try {
    if ('mysqlClient' in connector) {
      await connector.mysqlClient.$queryRawUnsafe(`
        DROP DATABASE IF EXISTS ${database};
      `);
      await connector.mysqlClient.$queryRawUnsafe(`
        CREATE DATABASE ${database};
      `);
    } else if ('postgresPool' in connector) {
      await connector.postgresPool.query(`
        DROP DATABASE IF EXISTS ${database} WITH (FORCE);
      `);
      await connector.postgresPool.query(`
        CREATE DATABASE ${database};
      `);
    }
  } finally {
    await disconnect(connector);
  }
};
