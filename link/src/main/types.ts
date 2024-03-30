import type { MySqlClient, PostgresClient, Prisma } from '../../prisma';
import { z } from 'zod';

export const connectionSchema = z.object({
  database: z.string().trim().min(1),
  engine: z.union([z.literal('mysql'), z.literal('postgresql')]),
  host: z.string().trim().min(1),
  id: z.string(),
  name: z.string().trim().min(1),
  password: z.string(),
  port: z.number(),
  user: z.string().trim().min(1),
});

export type Connection = z.infer<typeof connectionSchema>;

export type Client = {
  connection: Connection;
  prisma: MySqlClient | PostgresClient;
};

export type PrismaValue = string | number | boolean | Date | Prisma.Decimal | null;
