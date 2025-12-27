import type {
  AddToKeychain,
  ConnectDb,
  DisconnectDb,
  GetSqliteFile,
  NativeBridgeMessage,
  RunQuery,
  WriteToClipboard,
} from '@/native/types';
import { useCallback, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { v4 as uuid } from 'uuid';

export const isElectron = Boolean(window.electronAPI);
export const isReactNative = Boolean(window.ReactNativeWebView);
export const isNative = isElectron || isReactNative;

export const useNative = () => {
  const request = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any) => any, R = Awaited<ReturnType<T>>>(
      method: string,
      args: unknown[],
    ) => {
      if (isElectron) {
        assert(window.electronAPI, 'Electron is not available');
        return window.electronAPI.handleRequest(method, args) as Promise<R>;
      }

      assert(window.ReactNativeWebView, 'Native is not available');

      const id = uuid();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'request', id, method, args }));

      return new Promise<R>((resolve, reject) => {
        const onMessage = (event: MessageEvent) => {
          const parsed = JSON.parse(event.data) as NativeBridgeMessage;
          if (parsed.type === 'response' && parsed.requestId === id) {
            window.removeEventListener('message', onMessage);

            if ('error' in parsed) {
              reject(new Error(parsed.error));
            } else {
              resolve(parsed.data as R);
            }
          }
        };

        window.addEventListener('message', onMessage);
      });
    },
    [],
  );

  const addToKeychain = useCallback<AddToKeychain>(
    (username, password) => request<AddToKeychain>('addToKeychain', [username, password]),
    [request],
  );

  const connectDb = useCallback<ConnectDb>(
    (connection) => request<ConnectDb>('connectDb', [connection]),
    [request],
  );

  const disconnectDb = useCallback<DisconnectDb>(
    (connectorId) => request<DisconnectDb>('disconnectDb', [connectorId]),
    [request],
  );

  const runQuery = useCallback<RunQuery>(
    (props) => request<RunQuery>('runQuery', [props]),
    [request],
  );

  const getSqliteFile = useCallback<GetSqliteFile>(
    (connectionId) => request<GetSqliteFile>('getSqliteFile', [connectionId]),
    [request],
  );

  const writeToClipboard = useCallback<WriteToClipboard>(
    (text) => request<WriteToClipboard>('writeToClipboard', [text]),
    [request],
  );

  return useMemo(
    () => ({
      addToKeychain,
      connectDb,
      disconnectDb,
      getSqliteFile,
      runQuery,
      writeToClipboard,
    }),
    [addToKeychain, connectDb, disconnectDb, getSqliteFile, runQuery, writeToClipboard],
  );
};
