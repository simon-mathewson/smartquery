import { z } from "zod";

export const baseConnectionSchema = z.object({
  database: z.string().trim().min(1),
  id: z.string().min(1),
  name: z.string().trim().min(1),
  storageLocation: z.union([z.literal("local"), z.literal("cloud")]),
});

export const remoteConnectionSchema = baseConnectionSchema.extend({
  credentialStorage: z.union([
    z.literal("alwaysAsk"),
    z.literal("encrypted"),
    z.literal("plain"),
  ]),
  engine: z.union([z.literal("mysql"), z.literal("postgres")]),
  host: z.string().trim().min(1),
  password: z.string().nullable(),
  port: z.number(),
  schema: z.string().trim().min(1).optional(),
  ssh: z
    .object({
      host: z.string().trim().min(1),
      password: z.string().nullable().optional(),
      port: z.number(),
      privateKey: z.string().nullable().optional(),
      user: z.string().trim().min(1),
    })
    .nullable(),
  type: z.literal("remote"),
  user: z.string().trim().min(1),
});

export type RemoteConnection = z.infer<typeof remoteConnectionSchema>;

export const fileConnectionSchema = baseConnectionSchema.extend({
  engine: z.literal("sqlite"),
  type: z.literal("file"),
});

export type FileConnection = z.infer<typeof fileConnectionSchema>;

export const connectionSchema = z
  .discriminatedUnion("type", [remoteConnectionSchema, fileConnectionSchema])
  .refine(
    (conn) =>
      conn.type !== "remote" ||
      conn.credentialStorage !== "encrypted" ||
      Boolean(conn.password),
    {
      message:
        "Password is required when credential storage is set to encrypted",
    }
  )
  .refine((conn) => conn.engine !== "postgres" || Boolean(conn.schema), {
    message: "Schema is required when engine is set to postgres",
  });

export type Connection = z.infer<typeof connectionSchema>;

export type Engine = Connection["engine"];
