import { cloneDeep } from 'lodash';
import { assert } from 'ts-essentials';
import { z } from 'zod';
import type { Engine } from '~/shared/types';
import { connectionSchema } from '~/shared/types';

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

export type FormValues = z.infer<typeof formSchema>;

export const isFormValid = (form: FormValues) => {
  try {
    getConnectionFromForm(form);
    return true;
  } catch (error) {
    return false;
  }
};

export const getConnectionFromForm = (formArg: FormValues) => {
  const form = cloneDeep(formArg);

  assert(form.engine);

  if (!form.port) {
    form.port = getDefaultPort(form.engine);
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

export const getDefaultPort = (engine: Engine) =>
  ({
    mysql: 3306,
    postgresql: 5432,
  })[engine];
