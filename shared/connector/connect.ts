import { uniqueId } from 'lodash-es';
import { createSshTunnel } from './createSshTunnel';
import type { RemoteConnection } from '@/connections/types';
import { MySqlClient } from './prisma';
import type { Connector } from './types';
import { Pool as PostgresPool } from 'pg';

export const connect = async (connection: RemoteConnection): Promise<Connector> => {
  const {
    database,
    engine,
    host: remoteHost,
    password,
    port: remotePort,
    schema,
    ssh,
    user,
  } = connection;

  const connectorId = uniqueId();

  const { sshLocalHost, sshLocalPort, sshTunnel } = ssh
    ? await createSshTunnel(connection)
    : {
        sshLocalHost: undefined,
        sshLocalPort: undefined,
        sshTunnel: null,
      };

  const host = sshLocalHost ?? remoteHost;
  const port = sshLocalPort ?? remotePort;

  const encodedPassword = password ? encodeURIComponent(password) : '';

  if (engine === 'mysql') {
    const mysqlClient = new MySqlClient({
      datasourceUrl: `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`,
    });

    try {
      // Connect right away so we get an error if connection is invalid
      await mysqlClient.$connect();
    } catch (error: unknown) {
      console.error(error);
      if (sshTunnel) {
        void sshTunnel.shutdown();
      }
      throw error;
    }

    return {
      connection,
      id: connectorId,
      mysqlClient,
      sshTunnel,
    };
  }

  if (engine === 'postgres') {
    const pool = new PostgresPool({
      connectionString: `postgres://${user}:${encodedPassword}@${host}:${port}/${database}`,
    });

    // Important: Handle pool errors to prevent unhandled rejections
    pool.on('error', (error) => {
      console.error(error);
    });

    try {
      // Connect right away so we get an error if connection is invalid
      const client = await pool.connect();
      client.release();
      if (schema) {
        await pool.query(`SET search_path TO ${schema}`);
      }
    } catch (error: unknown) {
      console.error(error);
      if (sshTunnel) {
        void sshTunnel.shutdown();
      }
      throw error;
    }

    return {
      connection,
      id: connectorId,
      postgresPool: pool,
      sshTunnel,
    };
  }

  throw new Error(`Unsupported engine: ${engine}`);
};
