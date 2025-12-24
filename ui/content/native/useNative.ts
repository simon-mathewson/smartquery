import type {
  AddToKeychain,
  ConnectDb,
  DisconnectDb,
  GetSqliteFile,
  NativeBridgeMessage,
  RunQuery,
  WriteToClipboard,
} from '@/native/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { v4 as uuid } from 'uuid';

export const useNative = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [isReactNative] = useState(Boolean(window.ReactNativeWebView));
  const isNative = isElectron || isReactNative;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data) as NativeBridgeMessage;
      if (parsed.type === 'electron-ready') {
        setIsElectron(true);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isElectron, isNative, isReactNative]);

  const postMessage = useCallback(
    (message: string) => {
      if (isReactNative) {
        assert(window.ReactNativeWebView, 'Native is not available');
        window.ReactNativeWebView.postMessage(message);
      } else {
        window.parent.postMessage(message, '*');
      }
    },
    [isReactNative],
  );

  const request = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any) => any, R = Awaited<ReturnType<T>>>(
      method: string,
      args: unknown[],
    ) => {
      assert(isNative, 'Native is not available');

      const id = uuid();

      postMessage(JSON.stringify({ type: 'request', id, method, args }));

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
    [isNative, postMessage],
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
      isElectron,
      isNative,
      isReactNative,
      runQuery,
      writeToClipboard,
    }),
    [
      addToKeychain,
      connectDb,
      disconnectDb,
      getSqliteFile,
      isElectron,
      isNative,
      isReactNative,
      runQuery,
      writeToClipboard,
    ],
  );
};
