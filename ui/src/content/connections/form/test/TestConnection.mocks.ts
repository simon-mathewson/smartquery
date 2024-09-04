import { spy } from 'tinyspy';
import type { FormValues } from '../utils';
import type { TestConnectionProps } from './TestConnection';
import type { TestConnectionStoryProps } from './TestConnection.story';

export const getProps = () =>
  ({
    formValues: {
      credentialStorage: 'alwaysAsk',
      database: '',
      engine: null,
      host: '',
      id: '',
      name: '',
      password: '',
      port: null,
      ssh: null,
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

export const getMockTrpcClient = () =>
  ({
    connectDb: { mutate: spy() },
    disconnectDb: { mutate: spy() },
  }) as const;

export const getStoryProps = () =>
  ({
    mockTrpcClient: getMockTrpcClient(),
    props: getProps(),
    shouldFail: false,
    shouldFailWithAuthError: false,
  }) satisfies TestConnectionStoryProps;

export const expectedConnectInput = {
  credentialStorage: 'localStorage',
  database: 'test',
  engine: 'postgresql',
  host: 'localhost',
  id: '',
  name: 'test',
  password: 'password',
  port: 5432,
  ssh: null,
  user: 'user',
};
