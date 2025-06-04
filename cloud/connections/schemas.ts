import { fileConnectionSchema, remoteConnectionSchema } from '@/types/connection';
import { z } from 'zod';

export const createConnectionInputSchema = z.object({
  connection: z.discriminatedUnion('type', [
    remoteConnectionSchema.omit({ id: true, ssh: true }).extend({
      ssh: remoteConnectionSchema.shape.ssh.unwrap().nullable(),
      type: z.literal('remote'),
    }),
    fileConnectionSchema.omit({ id: true }).extend({
      type: z.literal('file'),
    }),
  ]),
  userPassword: z.string().optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionInputSchema>;

export const updateConnectionInputSchema = z.object({
  connection: z.discriminatedUnion('type', [
    remoteConnectionSchema.omit({ ssh: true }).extend({
      ssh: remoteConnectionSchema.shape.ssh.unwrap().nullable(),
      type: z.literal('remote'),
    }),
    fileConnectionSchema.extend({
      type: z.literal('file'),
    }),
  ]),
  userPassword: z.string().optional(),
});

export type UpdateConnectionInput = z.infer<typeof updateConnectionInputSchema>;
