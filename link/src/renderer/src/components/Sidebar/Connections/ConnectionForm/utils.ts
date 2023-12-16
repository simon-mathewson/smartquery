import { z } from 'zod';

export const connectionSchema = z.object({
  database: z.string().trim().min(1),
  host: z.string().trim().min(1),
  name: z.string().trim().min(1),
  password: z.string(),
  port: z.number(),
  user: z.string().trim().min(1),
});

export type ConnectionSchema = z.infer<typeof connectionSchema>;

export const formSchema = connectionSchema.extend({
  port: z.number().nullable(),
});

export type FormSchema = z.infer<typeof formSchema>;

export const isFormValid = (form: FormSchema) => {
  try {
    connectionSchema.parse(form);
    return true;
  } catch (error) {
    return false;
  }
};
