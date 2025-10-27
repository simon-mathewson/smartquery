import type { RemoteConnection } from '@/connections/types';
import { uniqueId } from 'lodash-es';
import mysql from 'mysql2/promise';
import { Pool as PostgresPool } from 'pg';
import { createSshTunnel } from './createSshTunnel';
import type { Connector } from './types';

export const connect = async (
  connection: RemoteConnection,
  options?: { retryWithoutSsl?: boolean },
): Promise<Connector> => {
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

  if (engine === 'mysql') {
    const pool = mysql.createPool({
      database,
      host,
      password: password ?? undefined,
      port,
      user,
      ssl: options?.retryWithoutSsl ? undefined : { rejectUnauthorized: false },
    });

    try {
      // Connect right away so we get an error if connection is invalid
      const client = await pool.getConnection();
      client.release();
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === 'Server does not support secure connection' &&
        !options?.retryWithoutSsl
      ) {
        return connect(connection, { retryWithoutSsl: true });
      }

      console.error(error);
      if (sshTunnel) {
        void sshTunnel.shutdown();
      }
      throw error;
    }

    return {
      connection,
      id: connectorId,
      mysqlPool: pool,
      sshTunnel,
    };
  }

  if (engine === 'postgres') {
    const pool = new PostgresPool({
      database,
      host,
      password: password ?? undefined,
      port,
      user,
      ssl: options?.retryWithoutSsl ? false : { rejectUnauthorized: false },
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
      if (
        error instanceof Error &&
        error.message === 'The server does not support SSL connections' &&
        !options?.retryWithoutSsl
      ) {
        return connect(connection, { retryWithoutSsl: true });
      }

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
