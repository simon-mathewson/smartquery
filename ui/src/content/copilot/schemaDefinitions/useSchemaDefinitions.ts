import { omit } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '~/content/connections/Context';
import { TrpcContext } from '~/content/trpc/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { SchemaDefinitions } from './types';
import { DateTime } from 'luxon';
import { ToastContext } from '~/content/toast/Context';

export const useSchemaDefinitions = () => {
  const toast = useDefinedContext(ToastContext);

  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  assert(activeConnection);
  assert('clientId' in activeConnection);

  const { engine, id, database } = activeConnection;

  const [isLoading, setIsLoading] = useState(false);

  const [storedSchemaDefinitions, setStoredSchemaDefinitions] =
    useStoredState<SchemaDefinitions | null>(
      `useSchemaDefinitions.schemaDefinitions.${id}.${database}${
        engine === 'postgresql' ? `.${activeConnection.schema}` : ''
      }`,
      null,
    );

  const getSchemaDefinitions = useCallback(async () => {
    if (
      storedSchemaDefinitions &&
      DateTime.fromJSDate(storedSchemaDefinitions.createdAt).diffNow().minutes < 5
    ) {
      return storedSchemaDefinitions;
    }

    const { engine, database, schema } = activeConnection;

    setIsLoading(true);

    const statements = (() => {
      switch (engine) {
        case 'postgresql':
          return [
            `
            SELECT table_name, table_type  FROM information_schema.tables 
            WHERE table_catalog = '${database}'
            AND table_schema = '${schema}'
          `,
            `
            SELECT table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns
            WHERE table_catalog = '${database}'
            AND table_schema = '${schema}'
          `,
            `
            SELECT constraint_name, table_name, constraint_type FROM information_schema.table_constraints
            WHERE table_catalog = '${database}'
            AND table_schema = '${schema}'
            AND constraint_type <> 'CHECK'
          `,
            `
            SELECT table_name, view_definition FROM information_schema.views
            WHERE table_catalog = '${database}'
            AND table_schema = '${schema}'
          `,
          ];
        case 'mysql':
          return [
            `
              SELECT TABLE_NAME table_name, TABLE_TYPE table_type FROM information_schema.tables 
              WHERE TABLE_SCHEMA = '${database}'
            `,
            `
              SELECT TABLE_NAME table_name, COLUMN_NAME column_name, ORDINAL_POSITION ordinal_position, COLUMN_DEFAULT column_default, IS_NULLABLE is_nullable, DATA_TYPE data_type, CHARACTER_MAXIMUM_LENGTH character_maximum_length, NUMERIC_PRECISION numeric_precision, NUMERIC_SCALE numeric_scale FROM information_schema.columns
              WHERE TABLE_SCHEMA = '${database}'
            `,
            `
              SELECT CONSTRAINT_NAME constraint_name, TABLE_NAME table_name, CONSTRAINT_TYPE constraint_type FROM information_schema.table_constraints
              WHERE TABLE_SCHEMA = '${database}'
              AND CONSTRAINT_TYPE <> 'CHECK'
            `,
            `
              SELECT TABLE_NAME table_name, VIEW_DEFINITION view_definition FROM information_schema.views
              WHERE TABLE_SCHEMA = '${database}'
            `,
          ];
      }
    })();

    try {
      const results = await trpc.sendQuery.mutate({
        clientId: activeConnection.clientId,
        statements,
      });

      const [tables, columns, tableConstraints, views] = results;

      const processedTables = tables.map((table) => {
        return {
          ...table,
          columns: columns
            .filter((column) => column.table_name === table.table_name)
            .map((column) => omit(column, 'table_name')),
          tableConstraints: tableConstraints
            .filter((constraint) => constraint.table_name === table.table_name)
            .map((constraint) => omit(constraint, 'table_name')),
        };
      });

      const newSchemaDefinitions = {
        createdAt: new Date(),
        tables: processedTables,
        views,
      } satisfies SchemaDefinitions;

      setStoredSchemaDefinitions(newSchemaDefinitions);

      return newSchemaDefinitions;
    } catch (error) {
      toast.add({
        title: 'Error fetching schema definitions',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    activeConnection,
    setStoredSchemaDefinitions,
    storedSchemaDefinitions,
    toast,
    trpc.sendQuery,
  ]);

  // Fetch schema definitions when active connection changes
  useEffect(() => {
    getSchemaDefinitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  return useMemo(
    () => ({
      getSchemaDefinitions,
      hasSchemaDefinitions: storedSchemaDefinitions !== null,
      isLoading,
    }),
    [getSchemaDefinitions, isLoading, storedSchemaDefinitions],
  );
};
