import { z } from 'zod';

export const createSavedQueryInputSchema = z.object({
  connectionId: z.string(),
  database: z.string().nullable(),
  name: z.string(),
  sql: z.string(),
});

export const listSavedQueriesInputSchema = z.object({
  connectionId: z.string(),
  database: z.string().nullable(),
});

export const updateSavedQueryInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  sql: z.string().optional(),
});
