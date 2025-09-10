import { z } from 'zod';

export const listSavedQueriesInputSchema = z.object({
  connectionId: z.string(),
  database: z.string().nullable(),
});
