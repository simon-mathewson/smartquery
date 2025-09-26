import type { SSHConnection } from 'node-ssh-forward';
import type { MySqlClient, PostgresClient } from './prisma';
import type { RemoteConnection } from '@/connections/types';

export type Connector = {
  connection: RemoteConnection;
  id: string;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: SSHConnection | null;
};
