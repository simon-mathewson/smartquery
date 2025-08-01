import { remoteConnectionSchema } from '@/connections/types';
import { z } from 'zod';

export const createConnectionInputSchema = z.object({
  connection: remoteConnectionSchema.omit({ ssh: true }).extend({
    ssh: remoteConnectionSchema.shape.ssh.unwrap().nullable(),
    type: z.literal('remote'),
  }),
  userPassword: z.string().optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionInputSchema>;

export const updateConnectionInputSchema = z.object({
  connection: remoteConnectionSchema.omit({ ssh: true }).extend({
    ssh: remoteConnectionSchema.shape.ssh.unwrap().nullable(),
    type: z.literal('remote'),
  }),
  userPassword: z.string().optional(),
});

export type UpdateConnectionInput = z.infer<typeof updateConnectionInputSchema>;
