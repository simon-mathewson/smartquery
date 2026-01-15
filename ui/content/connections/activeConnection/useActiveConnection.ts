import type { Results } from '@/native/types';
import { ConnectorNotFoundError } from '@/errors/ConnectorNotFoundError';
import { NoLongerConnectedError } from '@/errors/NoLongerConnectedError';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { NativeContext } from '~/content/native/Context';
import { SqliteContext } from '~/content/sqlite/Context';
import type { SqliteFile } from '~/content/sqlite/useSqlite';
import { getSelectFromStatement } from '~/content/tabs/queries/utils/parse';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { ActiveConnection, Database, Query, QueryResult, TableType } from '~/shared/types';
import { ConnectionsContext } from '../Context';
import { getResultsAsRecords } from '~/content/tabs/queries/utils/getResultsAsRecords';
import { uniqBy } from 'lodash';
import { getVirtualColumn } from '~/content/tabs/queries/utils/getVirtualColumn';
import { getAllColumns, getColumnsStatements } from '~/content/tabs/queries/utils/columns';
import { getTotalRowsStatement } from '~/content/tabs/queries/utils/getTotalRowsStatement';
import { getTableStatements } from '~/content/tabs/queries/utils/getTableStatements';

export const useActiveConnection = () => {
  const native = useDefinedContext(NativeContext);
  const toast = useDefinedContext(ToastContext);
  const { activeConnection, connect } = useDefinedContext(ConnectionsContext);
  const { getSqliteFile, requestFileHandlePermission, writeSqliteFile } =
    useDefinedContext(SqliteContext);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

  const runQuery = useCallback(
    async (
      statements: string[],
      options?: { overrideActiveConnection?: ActiveConnection; skipSqliteWrite?: boolean },
    ) => {
      const currentConnection = options?.overrideActiveConnection ?? activeConnection;

      assert(currentConnection);

      if (currentConnection.engine !== 'sqlite') {
        try {
          return await native.runQuery({
            connectorId: currentConnection.connectorId,
            statements,
          });
        } catch (error) {
          if (error instanceof NoLongerConnectedError || error instanceof ConnectorNotFoundError) {
            const newConnection = await connect(currentConnection.id, {
              database: currentConnection.database,
              schema: currentConnection.schema,
            });

            if (newConnection) {
              toast.add({
                color: 'success',
                title: 'Reconnected successfully',
              });

              return runQuery(statements, { overrideActiveConnection: newConnection });
            } else {
              throw error;
            }
          }

          if (error instanceof Error) {
            toast.add({
              color: 'danger',
              description: getErrorMessage(error),
              title: 'Query failed',
            });
          }

          throw error;
        }
      }

      let sqliteFile: SqliteFile | null = null;

      const hasOnlySelectStatements = await Promise.all(
        statements.map((statement) =>
          getSelectFromStatement({ connection: currentConnection, statement }),
        ),
      ).then((results) => results.every((result) => result !== null));

      if (!hasOnlySelectStatements && !options?.skipSqliteWrite) {
        sqliteFile = await getSqliteFile(currentConnection.id);

        if (sqliteFile instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(sqliteFile);
        }
      }

      const results: Results = statements.map((statement) => {
        const result = currentConnection.sqliteDb.exec(statement).at(0);

        return {
          fields:
            result?.columns.map((column) => ({ name: column, type: 'column-or-virtual' })) ?? [],
          rows: result?.values.map((row) => row.map((v) => (v === null ? null : String(v)))) ?? [],
        };
      });

      if (sqliteFile) {
        const updatedDb = currentConnection.sqliteDb.export();

        if (sqliteFile instanceof FileSystemFileHandle) {
          const writable = await sqliteFile.createWritable();
          await writable.write(updatedDb);
          await writable.close();
        } else {
          let binary = '';
          updatedDb.forEach((b) => (binary += String.fromCharCode(b)));
          const base64 = btoa(binary);
          await writeSqliteFile({ ...sqliteFile, base64 }, currentConnection.id);
        }
      }

      return results;
    },
    [
      activeConnection,
      connect,
      getSqliteFile,
      requestFileHandlePermission,
      writeSqliteFile,
      toast,
      native,
    ],
  );

  const runUserSelectQuery = useCallback(
    async (query: Query): Promise<QueryResult> => {
      assert(activeConnection);

      const { select, statements } = query;
      assert(select);
      assert(statements?.length === 1);

      const selectStatement = statements[0];

      const columnsStatements = getColumnsStatements({
        connection: activeConnection,
        select,
      });

      const totalRowsStatement = await getTotalRowsStatement({
        connection: activeConnection,
        select,
      });

      const tableStatements = getTableStatements({
        connection: activeConnection,
        select,
      });

      const statementsWithMetadata = [selectStatement, ...columnsStatements, ...tableStatements];

      if (totalRowsStatement) {
        statementsWithMetadata.push(totalRowsStatement);
      }

      const results = await runQuery(statementsWithMetadata, { skipSqliteWrite: true });

      const firstSelectResult = results[0];
      const columnsResults = results
        .slice(1, columnsStatements.length + 1)
        .map((result) => getResultsAsRecords(result, { convertFieldNameToLowerCase: true }));
      const tableResults = results
        .slice(columnsStatements.length + 1, columnsStatements.length + tableStatements.length + 1)
        .map((result) => getResultsAsRecords(result, { convertFieldNameToLowerCase: true }));
      const totalRowsResult = totalRowsStatement
        ? getResultsAsRecords(results[results.length - 1])
        : null;

      const columns = getAllColumns({
        fields: firstSelectResult.fields,
        columnsResults,
        connection: activeConnection,
        records: getResultsAsRecords(firstSelectResult),
        select,
        tableResults,
      });

      const totalRows = Number(totalRowsResult?.at(0)?.count);

      const tables = select.tables.map(({ name, originalName, schema }, index) => ({
        name,
        originalName,
        schema,
        type: (tableResults[index].at(0)?.table_type ?? 'SYSTEM_VIEW') as TableType,
      }));

      return {
        columns,
        rows: firstSelectResult.rows,
        tables,
        totalRows,
      };
    },
    [activeConnection, runQuery],
  );

  const runUserQuery = useCallback(
    async (query: Query): Promise<QueryResult | null> => {
      const { select, statements } = query;

      assert(activeConnection);
      assert(statements);

      if (select && statements.length === 1) {
        return runUserSelectQuery(query);
      }

      const results = await runQuery(statements);

      const firstResultWithRows = results.find((result) => result.rows.length) ?? null;

      const records = firstResultWithRows ? getResultsAsRecords(firstResultWithRows) : [];
      const uniqueFields = firstResultWithRows ? uniqBy(firstResultWithRows.fields, 'name') : [];
      const columns = uniqueFields.map((field) => getVirtualColumn(records, field.name));

      const rows = firstResultWithRows?.rows.map((row) =>
        uniqueFields.map((field) => {
          const originalIndex = firstResultWithRows.fields.findIndex((f) => f.name === field.name);
          return row[originalIndex];
        }),
      );

      if (!rows) return null;

      return {
        columns,
        rows,
        tables: [],
      };
    },
    [activeConnection, runQuery, runUserSelectQuery],
  );

  const getDatabases = useCallback(async () => {
    assert(activeConnection);

    if (activeConnection.engine === 'sqlite') {
      return setDatabases([{ name: activeConnection.database, schemas: [] }]);
    }

    const databasesStatement = {
      mysql:
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
      postgres: 'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
    }[activeConnection.engine];

    const statements = [databasesStatement];

    if (activeConnection.engine === 'postgres') {
      statements.push(
        "SELECT schema_name, catalog_name FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
      );
    }

    setIsLoadingDatabases(true);

    try {
      await runQuery(statements).then(([dbResults, schemaResults]) => {
        setDatabases(
          dbResults.rows.map(([dbValue]) => {
            const db = String(dbValue);
            return {
              name: db,
              schemas:
                schemaResults?.rows
                  .filter(([_, schemaDb]) => db === String(schemaDb))
                  .map(([schema]) => String(schema)) ?? [],
            };
          }),
        );
      });
    } finally {
      setIsLoadingDatabases(false);
    }
  }, [activeConnection, runQuery]);

  useEffect(() => {
    if (activeConnection) {
      void getDatabases();
    } else {
      setDatabases([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  return useMemo(
    () =>
      activeConnection
        ? { activeConnection, databases, runUserQuery, isLoadingDatabases, runQuery }
        : null,
    [activeConnection, databases, runUserQuery, isLoadingDatabases, runQuery],
  );
};
