import type { z } from 'zod';
import { connectionSchema } from '~/shared/types';

export const formSchema = connectionSchema.extend({
  engine: connectionSchema.shape.engine.nullable(),
  password: connectionSchema.shape.password.unwrap(),
  port: connectionSchema.shape.port.nullable(),
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
