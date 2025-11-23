import { useCallback, useMemo, useRef } from 'react';
import type { SqlJsStatic } from 'sql.js';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { sqliteChooseFileOptions } from '~/content/sqlite/sqlite';
import { ToastContext } from '../toast/Context';
import type { SqliteDatabase } from '~/shared/types';
import { useNative } from '~/shared/hooks/useNative/useNative';
import { demoConnectionId } from '../connections/demo/constants';

const indexedDbConnection = 'sqliteStorage';
const indexedDbStore = 'sqlite';

export type SqliteFile = FileSystemFileHandle | { name: string; base64: string };

export const useSqlite = () => {
  const toast = useDefinedContext(ToastContext);

  const sqliteRef = useRef<SqlJsStatic | null>(null);

  const native = useNative();

  const getSqlite = useCallback(async (): Promise<SqlJsStatic> => {
    if (sqliteRef.current) return Promise.resolve(sqliteRef.current);

    const initSqlite = (await import('sql.js')).default;
    const sqlite = await initSqlite({
      locateFile: () => `${location.origin}/sql-wasm.wasm`,
    });

    sqliteRef.current = sqlite;
    return sqlite;
  }, []);

  const writeSqliteFile = useCallback(
    async (sqliteFile: SqliteFile, connectionId: string) => {
      if (
        'base64' in sqliteFile &&
        window.ReactNativeWebView &&
        connectionId !== demoConnectionId
      ) {
        await native.writeSqliteFile(connectionId, sqliteFile.base64);
      }

      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(indexedDbConnection, 1);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains('sqlite')) {
            db.createObjectStore('sqlite');
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = db.transaction(indexedDbStore, 'readwrite');
          const store = tx.objectStore(indexedDbStore);
          store.put(sqliteFile, connectionId);
          tx.oncomplete = () => resolve();
          tx.onerror = (error) => reject(error);
        };
      });
    },
    [native],
  );

  const getSqliteFile = useCallback(async (id: string) => {
    return new Promise<SqliteFile>((resolve, reject) => {
      const request = indexedDB.open(indexedDbConnection, 1);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(indexedDbStore, 'readonly');
        const store = tx.objectStore(indexedDbStore);
        const getRequest = store.get(id);
        getRequest.onsuccess = () => resolve(getRequest.result as SqliteFile);
        getRequest.onerror = (error) => reject(error);
      };
    });
  }, []);

  const requestFileHandlePermission = useCallback(async (fileHandle: FileSystemFileHandle) => {
    try {
      await fileHandle.requestPermission({ mode: 'readwrite' });
    } catch {
      throw new Error(`Unable to request permission to edit ${fileHandle.name}`);
    }

    const permission = await fileHandle.queryPermission({ mode: 'readwrite' });

    if (permission !== 'granted') {
      throw new Error(`Please grant permission to edit ${fileHandle.name}`);
    }
  }, []);

  const getSqliteDb = useCallback(
    async (connectionId: string) => {
      const sqlite = await getSqlite();

      try {
        const fileOrFileHandle = await getSqliteFile(connectionId);

        if (fileOrFileHandle instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(fileOrFileHandle);

          const file = await fileOrFileHandle.getFile();
          return new sqlite.Database(new Uint8Array(await file.arrayBuffer()));
        }

        return new sqlite.Database(
          Uint8Array.from(atob(fileOrFileHandle.base64), (c) => c.charCodeAt(0)),
        );
      } catch {
        return new Promise<SqliteDatabase>((resolve, reject) => {
          toast.add({
            color: 'danger',
            title: 'Unable to find database file, click here to add it again',
            htmlProps: {
              onClick: async () => {
                try {
                  const [handle] = await window.showOpenFilePicker(sqliteChooseFileOptions);

                  await requestFileHandlePermission(handle);

                  await writeSqliteFile(handle, connectionId);

                  const file = await handle.getFile();
                  resolve(new sqlite.Database(new Uint8Array(await file.arrayBuffer())));
                } catch (error) {
                  reject(error);
                }
              },
            },
          });
        });
      }
    },
    [getSqlite, getSqliteFile, requestFileHandlePermission, writeSqliteFile, toast],
  );

  const pickFile = useCallback(
    async (connectionId: string): Promise<SqliteFile> => {
      if (window.ReactNativeWebView) {
        return native.getSqliteFile(connectionId);
      }

      const [handle] = await window.showOpenFilePicker(sqliteChooseFileOptions);
      return handle;
    },
    [native],
  );

  return useMemo(
    () => ({
      getSqlite,
      getSqliteDb,
      getSqliteFile,
      requestFileHandlePermission,
      writeSqliteFile,
      pickFile,
    }),
    [getSqlite, getSqliteDb, getSqliteFile, requestFileHandlePermission, writeSqliteFile, pickFile],
  );
};
