import { useCallback, useMemo, useRef } from 'react';
import type { SqlJsStatic } from 'sql.js';
import initSqlite from 'sql.js';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { sqliteChooseFileOptions } from '~/shared/utils/sqlite/sqlite';
import { ToastContext } from '../toast/Context';

const indexedDbConnection = 'sqliteStorage';
const indexedDbStore = 'sqlite';

export const useSqlite = () => {
  const toast = useDefinedContext(ToastContext);

  const sqliteRef = useRef<SqlJsStatic | null>(null);

  const getSqlite = useCallback((): Promise<SqlJsStatic> => {
    if (sqliteRef.current) return Promise.resolve(sqliteRef.current);

    return initSqlite({
      locateFile: () => `${location.origin}/sql-wasm.wasm`,
    }).then((sqlite) => {
      sqliteRef.current = sqlite;
      return sqlite;
    });
  }, []);

  const storeSqliteContent = useCallback(
    async (fileOrFileHandle: FileSystemFileHandle | ArrayBuffer, id: string) =>
      new Promise<void>((resolve, reject) => {
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
          store.put(fileOrFileHandle, id);
          tx.oncomplete = () => resolve();
          tx.onerror = (error) => reject(error);
        };
      }),
    [],
  );

  const getSqliteContent = useCallback(async (id: string) => {
    return new Promise<ArrayBuffer | FileSystemFileHandle>((resolve, reject) => {
      const request = indexedDB.open(indexedDbConnection, 1);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(indexedDbStore, 'readonly');
        const store = tx.objectStore(indexedDbStore);
        const getRequest = store.get(id);
        getRequest.onsuccess = () =>
          resolve(getRequest.result as ArrayBuffer | FileSystemFileHandle);
        getRequest.onerror = (error) => reject(error);
      };
    });
  }, []);

  const requestFileHandlePermission = useCallback(async (fileHandle: FileSystemFileHandle) => {
    try {
      await fileHandle.requestPermission({ mode: 'readwrite' });
    } catch (error) {
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
        const fileOrFileHandle = await getSqliteContent(connectionId);

        if (fileOrFileHandle instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(fileOrFileHandle);

          const file = await fileOrFileHandle.getFile();
          return new sqlite.Database(new Uint8Array(await file.arrayBuffer()));
        }

        return new sqlite.Database(new Uint8Array(fileOrFileHandle));
      } catch (error) {
        return new Promise<SqlJsStatic['Database']>((resolve, reject) => {
          toast.add({
            color: 'danger',
            title: 'Unable to find database file, click here to add it again',
            htmlProps: {
              onClick: async () => {
                try {
                  const [handle] = await window.showOpenFilePicker(sqliteChooseFileOptions);

                  await requestFileHandlePermission(handle);

                  await storeSqliteContent(handle, connectionId);

                  const file = await handle.getFile();
                  resolve(
                    new sqlite.Database(
                      new Uint8Array(await file.arrayBuffer()),
                    ) as unknown as SqlJsStatic['Database'],
                  );
                } catch (error) {
                  reject(error);
                }
              },
            },
          });
        });
      }
    },
    [getSqlite, getSqliteContent, requestFileHandlePermission, storeSqliteContent, toast],
  );

  return useMemo(
    () => ({
      getSqlite,
      getSqliteDb,
      getSqliteContent,
      requestFileHandlePermission,
      storeSqliteContent,
    }),
    [getSqlite, getSqliteDb, getSqliteContent, requestFileHandlePermission, storeSqliteContent],
  );
};
