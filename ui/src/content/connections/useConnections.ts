import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ActiveConnection, Database } from '~/shared/types';
import type { Connection, RemoteConnection } from '@/types/connection';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useLocation, useRoute } from 'wouter';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkApiContext } from '../link/api/Context';
import { ToastContext } from '../toast/Context';
import { SqliteContext } from '../sqlite/Context';
import { assert } from 'ts-essentials';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { CloudApiContext } from '../cloud/api/Context';
import { omit, sortBy } from 'lodash';
import { AuthContext } from '../auth/Context';
import type { UserPasswordModalInput } from './UserPasswordModal/types';

export type Connections = ReturnType<typeof useConnections>;

export type UseConnectionsProps = {
  signInModal: ModalControl<SignInModalInput>;
  userPasswordModal: ModalControl<UserPasswordModalInput>;
};

export const useConnections = (props: UseConnectionsProps) => {
  const { signInModal, userPasswordModal } = props;

  const [, navigate] = useLocation();

  const cloudApi = useDefinedContext(CloudApiContext);
  const linkApi = useDefinedContext(LinkApiContext);
  const { user } = useDefinedContext(AuthContext);
  const toast = useDefinedContext(ToastContext);
  const { getSqliteDb } = useDefinedContext(SqliteContext);

  const [localConnections, setLocalConnections] = useStoredState<Connection[]>(
    'connections',
    [],
    undefined,
    [
      (storedConnections) =>
        storedConnections.map(
          (c) =>
            ({
              ...c,
              engine: (c.engine as string) === 'postgresql' ? 'postgres' : c.engine,
              storageLocation: c.storageLocation ?? 'local',
              ...(c.type === 'remote' && {
                credentialStorage:
                  (c.credentialStorage as string) === 'localStorage'
                    ? 'plain'
                    : c.credentialStorage,
                ssh: c.ssh ? omit(c.ssh, 'credentialStorage') : null,
              }),
            }) as Connection,
        ),
    ],
  );

  const [cloudConnections, refetchCloudConnections] = useCloudQuery(
    () => cloudApi.connections.list.query(),
    {
      disabled: !user,
    },
  );

  const connections = useMemo(
    () => sortBy([...localConnections, ...(cloudConnections ?? [])], (c) => c.name.toLowerCase()),
    [localConnections, cloudConnections],
  );

  const [, dbRouteParamsWithoutSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: undefined;
  }>(routes.database({ schema: '' }));

  const [, dbRouteParamsWithSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: string;
  }>(routes.database());

  const dbRouteParams = dbRouteParamsWithSchema ?? dbRouteParamsWithoutSchema;

  const {
    connectionId: connectionIdParam,
    database: databaseParam,
    schema: schemaParam,
  } = dbRouteParams ?? {};

  const previousRouteParamsRef = useRef<typeof dbRouteParams | undefined>(undefined);

  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  const [activeConnectionDatabases, setActiveConnectionDatabases] = useState<Database[]>([]);

  const addConnection = useCallback(
    async (connection: Connection, onSuccess?: () => void) => {
      try {
        if (connection.storageLocation === 'local') {
          setLocalConnections([...localConnections, connection]);
        } else {
          if (connection.type === 'remote' && connection.credentialStorage === 'encrypted') {
            await new Promise<void>((resolve) =>
              userPasswordModal.open({
                mode: 'encrypt',
                onSubmit: async (password) => {
                  await cloudApi.connections.create.mutate({
                    connection,
                    userPassword: password,
                  });
                  resolve();
                },
              }),
            );
          } else {
            await cloudApi.connections.create.mutate({ connection });
          }

          await refetchCloudConnections();
        }

        toast.add({
          color: 'success',
          title: 'Connection added',
        });

        onSuccess?.();
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Failed to add connection',
        });
      }
    },
    [
      toast,
      setLocalConnections,
      localConnections,
      refetchCloudConnections,
      userPasswordModal,
      cloudApi,
    ],
  );

  const updateConnection = useCallback(
    async (id: string, connection: Connection, onSuccess?: () => void) => {
      const existingConnection = connections.find((c) => c.id === id);
      assert(existingConnection);

      try {
        if (connection.storageLocation === 'local') {
          setLocalConnections(localConnections.map((c) => (c.id === id ? connection : c)));
        } else {
          if (
            connection.type === 'remote' &&
            (connection.credentialStorage === 'encrypted' ||
              (existingConnection.type === 'remote' &&
                existingConnection.credentialStorage === 'encrypted'))
          ) {
            await new Promise<void>((resolve) =>
              userPasswordModal.open({
                mode: connection.credentialStorage === 'encrypted' ? 'encrypt' : 'decrypt',
                onSubmit: async (password) => {
                  await cloudApi.connections.update.mutate({ connection, userPassword: password });
                  resolve();
                },
              }),
            );
          } else {
            await cloudApi.connections.update.mutate({ connection });
          }

          if (existingConnection.storageLocation === 'local') {
            setLocalConnections(localConnections.filter((c) => c.id !== existingConnection.id));
          }

          await refetchCloudConnections();
        }

        toast.add({
          color: 'success',
          title: 'Connection updated',
        });

        onSuccess?.();
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Failed to update connection',
        });
      }
    },
    [
      connections,
      toast,
      setLocalConnections,
      localConnections,
      refetchCloudConnections,
      userPasswordModal,
      cloudApi,
    ],
  );

  const disconnectRemote = useCallback(
    async (clientId: string) => {
      await linkApi.disconnectDb.mutate(clientId);
    },
    [linkApi],
  );

  const disconnect = useCallback(async () => {
    if (!activeConnection) return;

    if (activeConnection.type === 'remote') {
      await disconnectRemote(activeConnection.clientId);
    } else {
      activeConnection.sqliteDb.close();
    }

    setActiveConnection(null);
    setActiveConnectionDatabases([]);
  }, [activeConnection, disconnectRemote]);

  const removeConnection = useCallback(
    async (id: string) => {
      const connection = connections.find((c) => c.id === id);
      assert(connection);

      try {
        if (connection.storageLocation === 'local') {
          setLocalConnections(localConnections.filter((c) => c.id !== id));
        } else {
          await cloudApi.connections.delete.mutate({ id });
          await refetchCloudConnections();
        }

        toast.add({
          color: 'success',
          title: 'Connection removed',
        });

        if (activeConnection?.id === id) {
          void disconnect();
          navigate(routes.root());
        }
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Failed to remove connection',
        });
      }
    },
    [
      connections,
      toast,
      activeConnection?.id,
      setLocalConnections,
      localConnections,
      cloudApi.connections.delete,
      refetchCloudConnections,
      disconnect,
      navigate,
    ],
  );

  const getDatabases = useCallback(
    async (connection: Connection, clientId?: string) => {
      if (connection.engine === 'sqlite') {
        return setActiveConnectionDatabases([{ name: connection.database, schemas: [] }]);
      }

      assert(clientId);

      const databasesStatement = {
        mysql:
          "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
        postgres:
          'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
      }[connection.engine];

      const statements = [databasesStatement];

      if (connection.engine === 'postgres') {
        statements.push(
          "SELECT schema_name AS schema, catalog_name AS db FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
        );
      }

      await linkApi.sendQuery.mutate({ clientId, statements }).then(([dbRows, schemaRows]) => {
        setActiveConnectionDatabases(
          dbRows.map((dbRow) => {
            const db = String(dbRow.db);
            return {
              name: db,
              schemas:
                schemaRows
                  ?.filter((schemaRow) => db === String(schemaRow.db))
                  .map((schemaRow) => String(schemaRow.schema)) ?? [],
            };
          }),
        );
      });
    },
    [linkApi.sendQuery],
  );

  const connectRemote = useCallback(
    async (connection: RemoteConnection, options?: { skipDecryption?: boolean }) => {
      const { password, sshPassword, sshPrivateKey } = await (async () => {
        const storedCredentials = {
          password: connection.password ?? '',
          sshPassword: connection.ssh?.password ?? undefined,
          sshPrivateKey: connection.ssh?.privateKey ?? undefined,
        };

        if (
          connection.password === null ||
          connection.ssh?.password === null ||
          connection.ssh?.privateKey === null
        ) {
          return new Promise<{
            password: string;
            sshPassword: string | undefined;
            sshPrivateKey: string | undefined;
          }>((resolve) => {
            signInModal.open({
              connection,
              onSignIn: async (enteredCredentials) =>
                resolve({
                  password: enteredCredentials.password ?? storedCredentials.password,
                  sshPassword: enteredCredentials.sshPassword ?? storedCredentials.sshPassword,
                  sshPrivateKey:
                    enteredCredentials.sshPrivateKey ?? storedCredentials.sshPrivateKey,
                }),
            });
          });
        }

        if (connection.credentialStorage === 'encrypted' && !options?.skipDecryption) {
          return new Promise<{
            password: string;
            sshPassword: string | undefined;
            sshPrivateKey: string | undefined;
          }>((resolve) => {
            userPasswordModal.open({
              mode: 'decrypt',
              onSubmit: async (userPassword) => {
                const decryptedConnection = await cloudApi.connections.decryptCredentials.mutate({
                  id: connection.id,
                  userPassword,
                });

                assert(decryptedConnection.type === 'remote');

                resolve({
                  password: decryptedConnection.password ?? '',
                  sshPassword: decryptedConnection.ssh?.password ?? undefined,
                  sshPrivateKey: decryptedConnection.ssh?.privateKey ?? undefined,
                });
              },
            });
          });
        }

        return storedCredentials;
      })();

      return linkApi.connectDb.mutate({
        ...connection,
        password,
        ssh: connection.ssh
          ? {
              ...connection.ssh,
              password: sshPassword,
              privateKey: sshPrivateKey,
            }
          : null,
      });
    },
    [signInModal, userPasswordModal, cloudApi, linkApi, toast],
  );

  const connect = useCallback(
    async (
      id: string,
      overrides?: {
        database?: string;
        schema?: string;
      },
    ) => {
      const connection = connections.find((c) => c.id === id);

      if (!connection) {
        toast.add({ color: 'danger', title: `Connection with id ${id} not found` });
        navigate(routes.root());
        return;
      }

      await disconnect();

      try {
        if (connection.type === 'file') {
          const sqliteDb = await getSqliteDb(connection.id);
          const activeConnection = {
            ...connection,
            sqliteDb,
          } satisfies ActiveConnection;

          setActiveConnection(activeConnection);

          await getDatabases(connection);
        }

        const selectedDatabase = overrides?.database ?? connection.database;
        const selectedSchema =
          overrides?.schema ?? (connection.type === 'remote' ? connection.schema : undefined);

        if (connection.type === 'remote') {
          const newClientId = await connectRemote({
            ...connection,
            database: selectedDatabase,
            schema: selectedSchema,
          });

          setActiveConnection({
            ...connection,
            clientId: newClientId,
            database: selectedDatabase,
            schema: selectedSchema,
          } satisfies ActiveConnection);

          await getDatabases(connection, newClientId);
        }

        navigate(
          routes.database({
            connectionId: connection.id,
            database: selectedDatabase,
            schema: selectedSchema ?? '',
          }),
        );

        window.document.title = `${
          selectedSchema ? `${selectedSchema} – ` : ''
        }${selectedDatabase} – ${connection.name}`;
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          description: (error as Error).message,
          title: 'Failed to connect to database',
        });

        navigate(routes.root());
      }
    },
    [
      connections,
      disconnect,
      toast,
      navigate,
      getSqliteDb,
      getDatabases,
      linkApi,
      signInModal,
      userPasswordModal,
      cloudApi,
    ],
  );

  useEffectOnce(() => {
    if (connectionIdParam) {
      connect(connectionIdParam, { database: databaseParam, schema: schemaParam });
      return;
    }
  });

  // Disconnect when closing tab
  useEffect(() => {
    window.addEventListener('beforeunload', disconnect);

    return () => {
      window.removeEventListener('beforeunload', disconnect);
    };
  }, [disconnect]);

  // Disconnect when navigating to non-DB route
  useEffect(() => {
    const previousRouteParams = previousRouteParamsRef.current;
    previousRouteParamsRef.current = dbRouteParams;

    if (!previousRouteParams) return;

    const { connectionId: previousConnectionId, database: previousDatabase } = previousRouteParams;
    const { connectionId: nextConnectionId, database: nextDatabase } = dbRouteParams ?? {};

    if (
      previousConnectionId &&
      previousDatabase &&
      (nextConnectionId === undefined || nextDatabase === undefined)
    ) {
      void disconnect();
    }
  }, [disconnect, dbRouteParams]);

  return useMemo(
    () => ({
      activeConnection,
      activeConnectionDatabases,
      addConnection,
      connect,
      connectRemote,
      connections,
      disconnectRemote,
      removeConnection,
      updateConnection,
    }),
    [
      activeConnection,
      activeConnectionDatabases,
      addConnection,
      connect,
      connectRemote,
      connections,
      disconnectRemote,
      removeConnection,
      updateConnection,
    ],
  );
};
