import type { MySqlClient, PostgresClient } from './prisma';
import type { RemoteConnection } from '@/connections/types';
import type { SshConnection } from './ssh/SshConnection';

export type Connector = {
  connection: RemoteConnection;
  id: string;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: SshConnection | null;
};
