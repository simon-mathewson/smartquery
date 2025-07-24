import { SSHConnection } from "node-ssh-forward";
import { MySqlClient, PostgresClient } from "./prisma";
import { RemoteConnection } from "@/types/connection";

export type Connector = {
  connection: RemoteConnection;
  id: string;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: SSHConnection | null;
};
