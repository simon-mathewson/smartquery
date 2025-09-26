import { uniqueId } from 'lodash-es';
import { createSshTunnel } from './ssh/createSshTunnel';
import type { RemoteConnection } from '@/connections/types';
import { MySqlClient, PostgresClient } from './prisma';
import type { Connector } from './types';

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

  const client = (() => {
    const encodedPassword = password ? encodeURIComponent(password) : '';

    if (engine === 'mysql') {
      return new MySqlClient({
        datasourceUrl: `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`,
      });
    }
    if (engine === 'postgres') {
      return new PostgresClient({
        datasourceUrl: `postgres://${user}:${encodedPassword}@${host}:${port}/${database}${
          schema ? `?schema=${schema}` : ''
        }`,
      });
    }
    throw new Error(`Unsupported engine: ${engine}`);
  })();

  try {
    // Connect right away so we get an error if connection is invalid
    await client.$connect();
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
    prisma: client,
    sshTunnel,
  };
};
