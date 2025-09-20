import { useCallback, useMemo, useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { TabsContext } from '~/content/tabs/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { useDrag } from '~/content/dragAndDrop/useDrag/useDrag';
import { assert } from 'ts-essentials';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { uniq } from 'lodash';
import { addQuotes } from '~/shared/utils/sql/sql';
import { useEffect } from 'react';
import { getTableNamesSql } from './getTableNamesSql';
import { NavigationSidebarContext } from '../Context';

export type Table = { name: string; schema: string | undefined };

export const useTableList = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, isLoadingDatabases, runQuery } =
    useDefinedContext(ActiveConnectionContext);
  const { activeTab } = useDefinedContext(TabsContext);
  const { addQuery, queryResults } = useDefinedContext(QueriesContext);
  const navigationSidebar = useDefinedContext(NavigationSidebarContext);

  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tableNamesStatement = getTableNamesSql(activeConnection);

    setIsLoading(true);

    void runQuery([tableNamesStatement], { skipSqliteWrite: true })
      .then(([rows]) => {
        setTables(rows.map(({ t, s }) => ({ name: String(t), schema: s ? String(s) : undefined })));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  const selectedTables = uniq(
    activeTab?.queries.flatMap((query) =>
      query
        .map((q) => {
          const result = q.id in queryResults ? queryResults[q.id] : null;
          return !q.savedQueryId && result?.tables.length === 1
            ? tables.find((t) => t.name === result.tables[0].name && t.schema === result.schema)
            : undefined;
        })
        .filter(isNotUndefined),
    ),
  ) satisfies Table[];

  const getQuery = useCallback(
    (table: Table) => {
      assert(activeConnection);

      switch (activeConnection.engine) {
        case 'mysql':
          return {
            sql: `SELECT * FROM ${table.name} LIMIT 50`,
          };
        case 'postgres':
          return {
            sql: `SELECT * FROM ${
              activeConnection.schema ? '' : `${addQuotes(activeConnection.engine, table.schema!)}.`
            }${addQuotes(activeConnection.engine, table.name)} LIMIT 50`,
          };
        case 'sqlite':
          return {
            sql: `SELECT * FROM ${table.name} LIMIT 50`,
          };
      }
    },
    [activeConnection],
  );

  const { getHandleMouseDown, isDragging } = useDrag<Table>({
    onDrop: (dropProps) => {
      const {
        item: table,
        dropMarker: { column, horizontal, row },
      } = dropProps;

      assert(activeTab);

      void addQuery(getQuery(table), {
        position: { column, row: horizontal ? row : undefined },
        alwaysRun: true,
        tabId: activeTab.id,
      });

      track('table_list_drag_drop');
    },
  });

  const [search, setSearch] = useState<string | undefined>(undefined);

  const filteredTables = useMemo(() => {
    if (!search?.trim()) return tables;

    return tables.filter((table) => table.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search, tables]);

  const onSelect = useCallback(
    (table: Table) => {
      void addQuery(getQuery(table), {
        // Unless table is already selected, open tab that already contains this query if
        // applicable
        openIfExists: !selectedTables.includes(table),
      });
      track('table_list_select');
      navigationSidebar.setIsOpen(false);
    },
    [addQuery, getQuery, selectedTables, navigationSidebar, track],
  );

  return useMemo(
    () => ({
      filteredTables,
      getHandleMouseDown,
      isDragging,
      isLoading,
      isLoadingDatabases,
      onSelect,
      search,
      selectedTables,
      setSearch,
    }),
    [
      filteredTables,
      getHandleMouseDown,
      isDragging,
      isLoading,
      isLoadingDatabases,
      onSelect,
      search,
      selectedTables,
      setSearch,
    ],
  );
};
