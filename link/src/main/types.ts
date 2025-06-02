import type { MySqlClient, PostgresClient } from '../../prisma';
import type { SSHConnection } from 'node-ssh-forward';
import type { RemoteConnection } from '@/types/connection';

export type Client = {
  connection: RemoteConnection;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: SSHConnection | null;
};

export type Clients = { [connectionId: string]: Client };
