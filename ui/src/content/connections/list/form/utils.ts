import { assert } from 'ts-essentials';
import { z } from 'zod';
import { connectionSchema } from '~/shared/types';
import { cloneDeep } from 'lodash';

export const formSchema = connectionSchema.extend({
  engine: connectionSchema.shape.engine.nullable(),
  password: z.string(),
  port: connectionSchema.shape.port.nullable(),
  ssh: connectionSchema.shape.ssh
    .unwrap()
    .extend({
      credentialType: z.union([z.literal('password'), z.literal('privateKey')]),
      password: z.string(),
      privateKey: z.string(),
      port: connectionSchema.shape.ssh.unwrap().shape.port.nullable(),
    })
    .nullable(),
});

export type FormSchema = z.infer<typeof formSchema>;

export const isFormValid = (form: FormSchema) => {
  try {
    getConnectionFromForm(form);
    return true;
  } catch (error) {
    return false;
  }
};

export const getConnectionFromForm = (formArg: FormSchema) => {
  const form = cloneDeep(formArg);

  if (!form.port) {
    form.port = getDefaultPort(form.engine)!;
  }

  if (form.ssh && !form.ssh.port) {
    form.ssh.port = 22;
  }

  const connection = connectionSchema.parse(form);

  if (connection.credentialStorage !== 'localStorage') {
    connection.password = null;
  }

  if (form.ssh) {
    assert(connection.ssh);

    if (connection.ssh.credentialStorage !== 'localStorage') {
      if (form.ssh.credentialType === 'password') {
        connection.ssh.password = null;
      } else {
        connection.ssh.privateKey = null;
      }
    }

    if (form.ssh.credentialType === 'password') {
      connection.ssh.privateKey = undefined;
    } else {
      connection.ssh.password = undefined;
    }
  }

  return connection;
};

export const getDefaultPort = (engine: FormSchema['engine']) => {
  if (!engine) return undefined;

  return {
    mysql: 3306,
    postgresql: 5432,
  }[engine];
};
