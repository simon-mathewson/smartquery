import { spy } from 'tinyspy';
import type { FormValues } from '../utils';
import type { TestConnectionProps } from './TestConnection';
import type { TestConnectionStoryProps } from './TestConnection.story';

export const getProps = () =>
  ({
    formValues: {
      credentialStorage: 'alwaysAsk',
      database: '',
      engine: 'postgresql',
      host: '',
      id: '',
      name: '',
      password: '',
      port: null,
      ssh: null,
      type: 'remote',
      user: '',
    },
  }) satisfies TestConnectionProps;

export const getValidFormValues = () =>
  ({
    ...getProps().formValues,
    credentialStorage: 'localStorage',
    database: 'test',
    engine: 'postgresql',
    host: 'localhost',
    name: 'test',
    password: 'password',
    port: 5432,
    user: 'user',
  }) satisfies FormValues;

export const getMockLinkApiClient = () =>
  ({
    connectDb: { mutate: spy() },
    disconnectDb: { mutate: spy() },
  }) as const;

export const getStoryProps = () =>
  ({
    mockLinkApiClient: getMockLinkApiClient(),
    props: getProps(),
    shouldFail: false,
    shouldFailWithAuthError: false,
  }) satisfies TestConnectionStoryProps;

export const expectedConnectInput = {
  credentialStorage: 'localStorage',
  database: 'test',
  engine: 'postgresql',
  host: 'localhost',
  id: 'id',
  name: 'test',
  password: 'password',
  port: 5432,
  ssh: null,
  type: 'remote',
  user: 'user',
};
