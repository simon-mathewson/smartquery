import { z } from 'zod';

export const savedQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  sql: z.string(),
});

export type SavedQuery = {
  id: string;
  name: string;
  sql: string;
};
