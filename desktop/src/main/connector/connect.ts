import type { RemoteConnection } from '@/connections/types';
import { uniqueId } from 'lodash-es';
import mysql from 'mysql2/promise';
import { Pool as PostgresPool } from 'pg';
import { createSshTunnel } from './createSshTunnel';
import type { Connector } from './types';
import { ConnectionFailedError } from '@/errors/ConnectionFailedError';
import type { SSHConnection } from 'node-ssh-forward';

export const connect = async (
  connection: RemoteConnection,
  options?: { retryWithoutSsl?: boolean },
): Promise<Connector> => {
  const { database, engine, host: remoteHost, password, port: remotePort, ssh, user } = connection;

  const connectorId = uniqueId();

  let sshTunnel: SSHConnection | null = null;

  try {
    const sshInfo = ssh
      ? await createSshTunnel(connection)
      : {
          sshLocalHost: undefined,
          sshLocalPort: undefined,
          sshTunnel: null,
        };

    sshTunnel = sshInfo.sshTunnel;

    const host = sshInfo.sshLocalHost ?? remoteHost;
    const port = sshInfo.sshLocalPort ?? remotePort;

    if (engine === 'mysql') {
      const pool = mysql.createPool({
        database,
        host,
        password: password ?? undefined,
        port,
        user,
        ssl: options?.retryWithoutSsl ? undefined : { rejectUnauthorized: false },
      });

      // Connect right away so we get an error if connection is invalid
      const client = await pool.getConnection();
      client.release();

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
        connectionTimeoutMillis: 1000,
      });

      // Connect right away so we get an error if connection is invalid
      const client = await pool.connect();
      client.release();

      // Important: Handle pool errors to prevent unhandled rejections
      pool.on('error', (error) => {
        console.error(error);
      });

      return {
        connection,
        id: connectorId,
        postgresPool: pool,
        sshTunnel,
      };
    }
    throw new Error(`Unsupported engine: ${engine}`);
  } catch (error: unknown) {
    if (sshTunnel) {
      try {
        await sshTunnel.shutdown();
        // eslint-disable-next-line no-empty
      } catch {}
    }

    if (
      error instanceof Error &&
      (error.message === 'The server does not support SSL connections' ||
        error.message === 'Server does not support secure connection') &&
      !options?.retryWithoutSsl
    ) {
      return connect(connection, { retryWithoutSsl: true });
    }

    if (
      error instanceof Error &&
      'code' in error &&
      (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')
    ) {
      throw new ConnectionFailedError();
    }

    console.error(error);
    throw error;
  }
};
