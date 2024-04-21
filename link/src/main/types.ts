import type { MySqlClient, PostgresClient, Prisma } from '../../prisma';
import { z } from 'zod';
import type { NodeSSH } from 'node-ssh';

export const connectionSchema = z.object({
  database: z.string().trim().min(1),
  engine: z.union([z.literal('mysql'), z.literal('postgresql')]),
  host: z.string().trim().min(1),
  id: z.string(),
  name: z.string().trim().min(1),
  password: z.string(),
  port: z.number(),
  ssh: z
    .object({
      host: z.string().trim().min(1),
      port: z.number(),
      password: z.string().nullable(),
      privateKey: z.string().nullable(),
      user: z.string().trim().min(1),
    })
    .nullable(),
  user: z.string().trim().min(1),
});

export type Connection = z.infer<typeof connectionSchema>;

export type Client = {
  connection: Connection;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: NodeSSH | null;
};

export type PrismaValue = string | number | boolean | Date | Prisma.Decimal | null;
