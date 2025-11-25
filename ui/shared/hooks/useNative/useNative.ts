import type {
  ConnectDb,
  DisconnectDb,
  GetAnalyticsConsent,
  GetSqliteFile,
  NativeWebviewMessage,
  RequestAnalyticsConsent,
  RunQuery,
} from '@/native/types';
import { useCallback, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { v4 as uuid } from 'uuid';

export const useNative = () => {
  const request = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any) => any, R = Awaited<ReturnType<T>>>(
      method: string,
      args: unknown[],
    ) => {
      assert(window.ReactNativeWebView, 'Native is not available');

      const id = uuid();

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'request', id, method, args }));

      return new Promise<R>((resolve, reject) => {
        const onMessage = (event: MessageEvent) => {
          const parsed = JSON.parse(event.data) as NativeWebviewMessage;
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

  const requestAnalyticsConsent = useCallback<RequestAnalyticsConsent>(
    () => request<RequestAnalyticsConsent>('requestAnalyticsConsent', []),
    [request],
  );

  const getAnalyticsConsent = useCallback<GetAnalyticsConsent>(
    () => request<GetAnalyticsConsent>('getAnalyticsConsent', []),
    [request],
  );

  return useMemo(
    () => ({
      connectDb,
      disconnectDb,
      runQuery,
      getSqliteFile,
      requestAnalyticsConsent,
      getAnalyticsConsent,
    }),
    [
      connectDb,
      disconnectDb,
      runQuery,
      getSqliteFile,
      requestAnalyticsConsent,
      getAnalyticsConsent,
    ],
  );
};
