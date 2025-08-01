import { cloneDeep } from 'lodash';
import { assert } from 'ts-essentials';
import { z } from 'zod';
import type { User } from '~/content/auth/types';
import type { Connection, Engine } from '@/connections/types';
import {
  connectionSchema,
  fileConnectionSchema,
  remoteConnectionSchema,
} from '@/connections/types';

export const formSchema = z.discriminatedUnion('type', [
  remoteConnectionSchema.extend({
    password: z.string(),
    port: remoteConnectionSchema.shape.port.nullable(),
    ssh: remoteConnectionSchema.shape.ssh
      .unwrap()
      .extend({
        credentialType: z.union([z.literal('password'), z.literal('privateKey')]),
        password: z.string(),
        privateKey: z.string(),
        port: remoteConnectionSchema.shape.ssh.unwrap().shape.port.nullable(),
      })
      .nullable(),
    type: z.literal('remote'),
  }),
  fileConnectionSchema.extend({
    fileHandle: z.instanceof(window.FileSystemFileHandle).nullable(),
    type: z.literal('file'),
  }),
]);

export type FormValues = z.infer<typeof formSchema>;

export const getInitialFormValues = async (props: {
  connectionToEdit: Connection | null;
  getSqliteContent: (id: string) => Promise<ArrayBuffer | FileSystemFileHandle>;
  user: User | null;
}): Promise<FormValues> => {
  const { connectionToEdit, getSqliteContent, user } = props;

  if (connectionToEdit) {
    if (connectionToEdit.type === 'file') {
      const fileHandle = await getSqliteContent(connectionToEdit.id);

      return {
        ...connectionToEdit,
        fileHandle: fileHandle instanceof FileSystemFileHandle ? fileHandle : null,
      };
    }

    return {
      ...connectionToEdit,
      password: connectionToEdit?.password ?? '',
      schema: connectionToEdit?.schema ?? '',
      ssh: connectionToEdit?.ssh
        ? {
            ...connectionToEdit.ssh,
            credentialType:
              connectionToEdit.ssh.privateKey !== undefined ? 'privateKey' : 'password',
            password: connectionToEdit.ssh.password ?? '',
            privateKey: connectionToEdit.ssh.privateKey ?? '',
            privateKeyPassphrase:
              connectionToEdit.ssh.privateKeyPassphrase === undefined
                ? undefined
                : connectionToEdit.ssh.privateKeyPassphrase ?? '',
          }
        : null,
      type: 'remote',
    } satisfies FormValues;
  }

  return {
    credentialStorage: user ? 'encrypted' : 'alwaysAsk',
    database: '',
    engine: 'postgres',
    host: '',
    id: '',
    name: '',
    password: '',
    port: null,
    schema: '',
    ssh: null,
    storageLocation: user ? 'cloud' : 'local',
    type: 'remote',
    user: '',
  } satisfies FormValues;
};

export const isFormValid = (form: FormValues) => {
  try {
    getConnectionFromForm({ ...form, id: 'id' });
    return true;
  } catch (error) {
    return false;
  }
};

export const getConnectionFromForm = (formArg: FormValues) => {
  const form = cloneDeep(formArg);

  if (form.type === 'remote') {
    if (!form.port) {
      form.port = getDefaultPort(form.engine);
    }

    if (form.ssh && !form.ssh.port) {
      form.ssh.port = 22;
    }

    if (form.engine === 'postgres') {
      form.schema = form.schema || undefined;
    } else {
      form.schema = undefined;
    }
  } else {
    assert(form.fileHandle);

    form.database = form.fileHandle.name.split('.')[0];
  }

  const connection = connectionSchema.parse(form);

  if (form.type === 'remote' && connection.type === 'remote') {
    if (connection.credentialStorage === 'alwaysAsk') {
      connection.password = null;
    }

    if (form.ssh) {
      assert(connection.ssh);

      if (connection.credentialStorage === 'alwaysAsk') {
        if (form.ssh.credentialType === 'password') {
          connection.ssh.password = null;
        } else {
          connection.ssh.privateKey = null;
          if (typeof connection.ssh.privateKeyPassphrase === 'string') {
            connection.ssh.privateKeyPassphrase = null;
          }
        }
      }

      if (form.ssh.credentialType === 'password') {
        connection.ssh.privateKey = undefined;
        connection.ssh.privateKeyPassphrase = undefined;
      } else {
        connection.ssh.password = undefined;
      }
    }
  }

  return connection;
};

export const getDefaultPort = (engine: Exclude<Engine, 'sqlite'>) =>
  ({
    mysql: 3306,
    postgres: 5432,
  })[engine];
