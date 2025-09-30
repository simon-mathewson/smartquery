import type { Connection, RemoteConnection } from '@/connections/types';
import { TRPCClientError } from '@trpc/client';
import { omit, sortBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { useLocation, useRoute } from 'wouter';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ActiveConnection } from '~/shared/types';
import { AuthContext } from '../auth/Context';
import { CloudApiContext } from '../cloud/api/Context';
import { LinkApiContext } from '../link/api/Context';
import { SqliteContext } from '../sqlite/Context';
import { ToastContext } from '../toast/Context';
import { ConnectCanceledError } from './connectAbortedError';
import { demoConnectionId } from './demo/constants';
import type { SignInModalInput } from './signInModal/types';
import type { UserPasswordModalInput } from './userPasswordModal/types';
import { AnalyticsContext } from '../analytics/Context';
import { getOrCreateDemoConnection } from './demo/getOrCreateDemoConnection';

export type Connections = ReturnType<typeof useConnections>;

export type UseConnectionsProps = {
  signInModal: ModalControl<SignInModalInput>;
  userPasswordModal: ModalControl<UserPasswordModalInput>;
};

export const useConnections = (props: UseConnectionsProps) => {
  const { signInModal, userPasswordModal } = props;

  const [, navigate] = useLocation();

  const { cloudApi } = useDefinedContext(CloudApiContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const linkApi = useDefinedContext(LinkApiContext);
  const { user, isInitializing: isInitializingAuth } = useDefinedContext(AuthContext);
  const toast = useDefinedContext(ToastContext);
  const { getSqliteDb, storeSqliteContent } = useDefinedContext(SqliteContext);

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

  const cloudConnectionsQuery = useCloudQuery(() => cloudApi.connections.list.query(), {
    disabled: !user || isInitializingAuth,
  });

  const connections = useMemo(
    () =>
      sortBy([...localConnections, ...(cloudConnectionsQuery.results ?? [])], (c) =>
        c.name.toLowerCase(),
      ),
    [localConnections, cloudConnectionsQuery],
  );

  const [connectViaCloud, setConnectViaCloud] = useStoredState<boolean | null>(
    'useConnections.connectViaCloud',
    false,
  );

  const [, dbRouteParamsWithoutSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: undefined;
  }>(routes.connection({ schema: '' }));

  const [, dbRouteParamsWithSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: string;
  }>(routes.connection());

  const dbRouteParams = dbRouteParamsWithSchema ?? dbRouteParamsWithoutSchema;

  const {
    connectionId: connectionIdParam,
    database: databaseParam,
    schema: schemaParam,
  } = dbRouteParams ?? {};

  const previousRouteParamsRef = useRef<typeof dbRouteParams | undefined>(undefined);

  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  const addConnection = useCallback(
    async (connection: Connection, options?: { onSuccess?: () => void; skipToast?: boolean }) => {
      try {
        if (connection.storageLocation === 'local') {
          setLocalConnections([...localConnections, connection]);
        } else {
          assert(connection.type === 'remote');

          if (connection.credentialStorage === 'encrypted') {
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

          await cloudConnectionsQuery.run();
        }

        if (!options?.skipToast) {
          toast.add({
            color: 'success',
            title: 'Connection added',
          });
        }

        options?.onSuccess?.();
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
      cloudConnectionsQuery,
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
          assert(connection.type === 'remote');

          if (
            connection.credentialStorage === 'encrypted' ||
            (existingConnection.type === 'remote' &&
              existingConnection.credentialStorage === 'encrypted')
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

          await cloudConnectionsQuery.run();
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
      cloudConnectionsQuery,
      userPasswordModal,
      cloudApi,
    ],
  );

  const disconnectRemote = useCallback(
    async (props: { connectedViaCloud: boolean; connectorId: string }) => {
      const { connectedViaCloud, connectorId } = props;

      const endpoint = connectedViaCloud
        ? cloudApi.connector.disconnectDb.mutate
        : linkApi.disconnectDb.mutate;

      await endpoint(connectorId);
    },
    [cloudApi, linkApi],
  );

  const disconnect = useCallback(async () => {
    if (!activeConnection) return;

    if (activeConnection.type === 'remote') {
      await disconnectRemote(activeConnection);
    } else {
      activeConnection.sqliteDb.close();
    }

    setActiveConnection(null);
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
          await cloudConnectionsQuery.run();
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
      cloudApi,
      cloudConnectionsQuery,
      disconnect,
      navigate,
    ],
  );

  const getShouldConnectViaCloud = useCallback(
    (connection: RemoteConnection) => {
      const localHosts = ['localhost', '127.0.0.1', '::1'];

      return (
        connectViaCloud === true &&
        !localHosts.includes(connection.ssh ? connection.ssh.host : connection.host)
      );
    },
    [connectViaCloud],
  );

  const connectRemote = useCallback(
    async (
      connection: RemoteConnection,
      options?: {
        skipDecryption?: { password: boolean; ssh: boolean };
      },
    ) => {
      const skipDecryption = options?.skipDecryption ?? { password: false, ssh: false };

      const { password, sshPassword, sshPrivateKey, sshPrivateKeyPassphrase } = await (async () => {
        const storedCredentials = {
          password: connection.password ?? '',
          sshPassword: connection.ssh?.password ?? undefined,
          sshPrivateKey: connection.ssh?.privateKey ?? undefined,
          sshPrivateKeyPassphrase: connection.ssh?.privateKeyPassphrase ?? undefined,
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
            sshPrivateKeyPassphrase: string | undefined;
          }>((resolve, reject) => {
            signInModal.open(
              {
                connection,
                onSignIn: async (enteredCredentials) =>
                  resolve({
                    password: enteredCredentials.password ?? storedCredentials.password,
                    sshPassword: enteredCredentials.sshPassword ?? storedCredentials.sshPassword,
                    sshPrivateKey:
                      enteredCredentials.sshPrivateKey ?? storedCredentials.sshPrivateKey,
                    sshPrivateKeyPassphrase:
                      enteredCredentials.sshPrivateKeyPassphrase ??
                      storedCredentials.sshPrivateKeyPassphrase,
                  }),
              },
              { onClose: () => reject(new ConnectCanceledError()) },
            );
          });
        }

        if (
          connection.credentialStorage === 'encrypted' &&
          !(skipDecryption.password && skipDecryption.ssh)
        ) {
          return new Promise<{
            password: string;
            sshPassword: string | undefined;
            sshPrivateKey: string | undefined;
            sshPrivateKeyPassphrase: string | undefined;
          }>((resolve, reject) => {
            userPasswordModal.open(
              {
                mode: 'decrypt',
                onSubmit: async (userPassword) => {
                  const decryptedConnection = await cloudApi.connections.decryptCredentials.mutate({
                    id: connection.id,
                    userPassword,
                  });

                  assert(decryptedConnection.type === 'remote');

                  resolve({
                    password: skipDecryption.password
                      ? storedCredentials.password
                      : decryptedConnection.password ?? '',
                    sshPassword: skipDecryption.ssh
                      ? storedCredentials.sshPassword
                      : decryptedConnection.ssh?.password ?? undefined,
                    sshPrivateKey: skipDecryption.ssh
                      ? storedCredentials.sshPrivateKey
                      : decryptedConnection.ssh?.privateKey ?? undefined,
                    sshPrivateKeyPassphrase: skipDecryption.ssh
                      ? storedCredentials.sshPrivateKeyPassphrase
                      : decryptedConnection.ssh?.privateKeyPassphrase ?? undefined,
                  });
                },
              },
              { onClose: () => reject(new ConnectCanceledError()) },
            );
          });
        }

        return storedCredentials;
      })();

      const connectedViaCloud = getShouldConnectViaCloud(connection);

      const endpoint = connectedViaCloud
        ? cloudApi.connector.connectDb.mutate
        : linkApi.connectDb.mutate;

      const connectorId = await endpoint({
        ...connection,
        password,
        ssh: connection.ssh
          ? {
              ...connection.ssh,
              password: sshPassword,
              privateKey: sshPrivateKey,
              privateKeyPassphrase: sshPrivateKeyPassphrase,
            }
          : null,
      });

      return { connectedViaCloud, connectorId };
    },
    [getShouldConnectViaCloud, cloudApi, linkApi, signInModal, userPasswordModal],
  );

  const connect = useCallback(
    async (
      id: string,
      overrides?: {
        database?: string;
        schema?: string;
      },
    ) => {
      const connection =
        id === demoConnectionId
          ? await getOrCreateDemoConnection({ addConnection, connections, storeSqliteContent })
          : connections.find((c) => c.id === id);

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

          track('connect');

          setActiveConnection(activeConnection);

          return activeConnection;
        }

        const selectedDatabase = overrides?.database ?? connection.database;
        const selectedSchema =
          overrides?.schema ?? (connection.type === 'remote' ? connection.schema : undefined);

        if (connection.type === 'remote') {
          const { connectedViaCloud, connectorId: newConnectorId } = await connectRemote({
            ...connection,
            database: selectedDatabase,
            schema: selectedSchema,
          });

          const newActiveConnection = {
            ...connection,
            connectedViaCloud,
            connectorId: newConnectorId,
            database: selectedDatabase,
            schema: selectedSchema,
          } satisfies ActiveConnection;

          track('connect');

          setActiveConnection(newActiveConnection);

          return newActiveConnection;
        }
      } catch (error) {
        if (!(error instanceof ConnectCanceledError)) {
          if (
            error instanceof TRPCClientError &&
            error.message === 'Failed to fetch' &&
            connection.type === 'remote'
          ) {
            if (getShouldConnectViaCloud(connection)) {
              toast.add({
                color: 'danger',
                description: 'Are you offline? Check connectivity settings to connect locally.',
                title: 'Unable to reach Cloud',
              });
            } else {
              toast.add({
                color: 'danger',
                description: 'Is SmartQuery Link running? See connectivity settings for details.',
                title: 'Failed to reach Link',
              });
            }
          } else {
            toast.add({
              color: 'danger',
              description: (error as Error).message,
              title: 'Failed to connect to database',
            });
          }
        }

        navigate(routes.root());

        return null;
      }
    },
    [
      addConnection,
      connections,
      storeSqliteContent,
      disconnect,
      toast,
      navigate,
      getSqliteDb,
      track,
      connectRemote,
      getShouldConnectViaCloud,
    ],
  );

  const isReady = !isInitializingAuth && (!user || cloudConnectionsQuery.results !== null);

  // Connect based on URL params
  useEffect(() => {
    if (connectionIdParam && isReady) {
      void connect(connectionIdParam, { database: databaseParam, schema: schemaParam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionIdParam, databaseParam, schemaParam, isReady]);

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

  // Disconnect and navigate home if active connection can't be found (can happen after logout)
  useEffect(() => {
    if (activeConnection && !connections.find((c) => c.id === activeConnection.id)) {
      navigate(routes.root());
    }
  }, [activeConnection, connections, navigate]);

  return useMemo(
    () => ({
      activeConnection,
      addConnection,
      connect,
      connections,
      connectViaCloud,
      connectRemote,
      disconnectRemote,
      removeConnection,
      setConnectViaCloud,
      updateConnection,
    }),
    [
      activeConnection,
      addConnection,
      connect,
      connectViaCloud,
      connectRemote,
      connections,
      disconnectRemote,
      removeConnection,
      setConnectViaCloud,
      updateConnection,
    ],
  );
};
