import { z } from 'zod';

export const responseSchema = z.object({
  parts: z.array(
    z.union([
      z.string(),
      z.object({
        name: z.string(),
        sql: z.string(),
        chart: z
          .object({
            type: z.enum(['bar', 'line', 'pie']),
            xColumn: z.string(),
            xTable: z.string().nullable(),
            yColumn: z.string(),
            yTable: z.string().nullable(),
          })
          .nullable(),
      }),
    ]),
  ),
});

const promptSuggestionsSchema = z.object({
  suggestions: z.array(z.string()).length(5),
});

export { promptSuggestionsSchema };
