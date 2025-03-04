import { cloneDeep } from 'lodash';
import { assert } from 'ts-essentials';
import { z } from 'zod';
import type { useToast } from '~/content/toast/useToast';
import type { Connection, Engine } from '~/shared/types';
import { connectionSchema, fileConnectionSchema, remoteConnectionSchema } from '~/shared/types';
import { getFileHandle } from '~/shared/utils/fileHandles/fileHandles';

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
  }),
  fileConnectionSchema.extend({
    fileHandle: z.instanceof(window.FileSystemFileHandle).nullable(),
  }),
]);

export type FormValues = z.infer<typeof formSchema>;

export const getInitialFormValues = async (
  connectionToEdit: Connection | null,
  toast: ReturnType<typeof useToast>,
) => {
  if (connectionToEdit) {
    if (connectionToEdit.type === 'file') {
      const fileHandle = await (async () => {
        try {
          return await getFileHandle(connectionToEdit.id);
        } catch (error) {
          toast.add({
            color: 'danger',
            description: 'Database file not found. Please select the file again.',
            title: 'Error',
          });
          return null;
        }
      })();

      return { ...connectionToEdit, fileHandle };
    }

    return {
      ...connectionToEdit,
      password: connectionToEdit?.password ?? '',
      schema: connectionToEdit?.schema ?? '',
      ssh: connectionToEdit?.ssh
        ? {
            ...connectionToEdit.ssh,
            credentialType: connectionToEdit.ssh.password !== undefined ? 'password' : 'privateKey',
            password: connectionToEdit.ssh.password ?? '',
            privateKey: connectionToEdit.ssh.privateKey ?? '',
          }
        : null,
      type: 'remote',
    } satisfies FormValues;
  }

  return {
    credentialStorage: 'alwaysAsk',
    database: '',
    engine: 'postgresql',
    host: '',
    id: '',
    name: '',
    password: '',
    port: null,
    schema: '',
    ssh: null,
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

    if (form.engine === 'postgresql') {
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
  }

  return connection;
};

export const getDefaultPort = (engine: Exclude<Engine, 'sqlite'>) =>
  ({
    mysql: 3306,
    postgresql: 5432,
  })[engine];
