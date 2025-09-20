import { z } from 'zod';

export const chartSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']),
  xColumn: z.string(),
  xTable: z.string().nullable(),
  yColumn: z.string().nullable(),
  yTable: z.string().nullable(),
});

export type Chart = z.infer<typeof chartSchema>;

export const savedQuerySchema = z.object({
  chart: chartSchema.nullable().optional(),
  id: z.string(),
  name: z.string(),
  sql: z.string(),
});

export type SavedQuery = z.infer<typeof savedQuerySchema>;
