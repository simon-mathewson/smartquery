import type { Decimal } from 'decimal.js';
import type { MySqlClient, PostgresClient, SqlServerClient } from '../../prisma';
import { z } from 'zod';

export const connectionSchema = z.object({
  database: z.string().trim().min(1),
  engine: z.union([z.literal('mysql'), z.literal('postgresql'), z.literal('sqlserver')]),
  host: z.string().trim().min(1),
  id: z.string(),
  name: z.string().trim().min(1),
  password: z.string(),
  port: z.number(),
  user: z.string().trim().min(1),
});

type Connection = z.infer<typeof connectionSchema>;

export type Client = {
  connection: Connection;
  prisma: MySqlClient | PostgresClient | SqlServerClient;
};

const dataTypes = [
  'bigint',
  'boolean',
  'char',
  'character varying',
  'datetime',
  'decimal',
  'enum',
  'int',
  'integer',
  'json',
  'numeric',
  'time with time zone',
  'time without time zone',
  'time',
  'timestamp with time zone',
  'timestamp without time zone',
  'timestamp',
  'tinyint',
  'user-defined',
  'varchar',
] as const;

export type DataType = (typeof dataTypes)[number];

export type Column = {
  dataType?: DataType;
  enumValues?: string[] | null;
  isForeignKey?: boolean;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  name: string;
};

export type PrismaValue = string | number | boolean | Date | Decimal | null;
