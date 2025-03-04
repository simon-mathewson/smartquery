import { useCallback, useMemo, useRef } from 'react';
import type { SqlJsStatic } from 'sql.js';
import initSqlite from 'sql.js';

export const useSqlite = () => {
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

  return useMemo(() => ({ getSqlite }), [getSqlite]);
};
