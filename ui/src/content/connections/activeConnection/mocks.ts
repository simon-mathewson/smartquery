import { getConnectionsMock } from '../mocks';
import type { ActiveConnectionContextType } from './Context';

export const getActiveConnectionMock = () =>
  ({
    activeConnection: getConnectionsMock().activeConnection,
    databases: [
      { name: 'development', schemas: [] },
      { name: 'test', schemas: [] },
      { name: 'staging', schemas: [] },
    ],
    isLoadingDatabases: false,
  }) satisfies ActiveConnectionContextType;
