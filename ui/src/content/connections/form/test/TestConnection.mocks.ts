import { spy } from 'tinyspy';
import type { FormValues } from '../utils';
import type { TestConnectionProps } from './TestConnection';
import type { TestConnectionStoryProps } from './TestConnection.story';

export const getProps = () =>
  ({
    formValues: {
      credentialStorage: 'alwaysAsk',
      database: '',
      engine: 'postgres',
      host: '',
      id: '',
      name: '',
      password: '',
      port: null,
      ssh: null,
      storageLocation: 'local',
      type: 'remote',
      user: '',
    },
  }) satisfies TestConnectionProps;

export const getValidFormValues = () =>
  ({
    ...getProps().formValues,
    credentialStorage: 'plain',
    database: 'test',
    engine: 'postgres',
    host: 'localhost',
    name: 'test',
    password: 'password',
    port: 5432,
    schema: 'public',
    user: 'user',
  }) satisfies FormValues;

export const getMockConnectionsContext = () =>
  ({
    connectRemote: spy(async () => ''),
    disconnectRemote: spy(async () => {}),
  }) as const;

export const getStoryProps = () =>
  ({
    providers: {
      ConnectionsProvider: getMockConnectionsContext(),
    },
    props: getProps(),
    shouldFail: false,
  }) satisfies TestConnectionStoryProps;

export const expectedConnectInput = {
  credentialStorage: 'plain',
  database: 'test',
  engine: 'postgres',
  host: 'localhost',
  id: 'id',
  name: 'test',
  password: 'password',
  port: 5432,
  schema: 'public',
  ssh: null,
  storageLocation: 'local',
  type: 'remote',
  user: 'user',
};
