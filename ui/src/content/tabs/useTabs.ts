import { uniqueId } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Query, Tab } from '~/shared/types';
import type { AddQueryOptions } from './types';
import { getNewQuery } from './utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { trpc } from '~/trpc';

export const useTabs = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [tabs, _setTabs] = useState<Tab[]>([]);
  const tabsRef = useRef(tabs);
  const setTabs = useCallback((updateFn: (tabs: Tab[]) => Tab[]) => {
    tabsRef.current = updateFn(tabsRef.current);
    _setTabs(tabsRef.current);
  }, []);

  const [activeTabId, setActiveTabId] = useState<string | undefined>(undefined);

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

  const setQueries = useCallback(
    (updateFn: (queries: Query[][]) => Query[][], tabId?: string) => {
      setTabs((currentTabs) =>
        currentTabs.map((t) =>
          t.id === (tabId ?? activeTab?.id) ? { ...t, queries: updateFn(t.queries) } : t,
        ),
      );
    },
    [setTabs, activeTab],
  );

  const runQuery = useCallback(
    (id: string, tabId?: string) => {
      const tab = tabsRef.current.find((t) => t.id === (tabId ?? activeTab?.id));
      const query = tab?.queries.flat().find((q) => q.id === id);

      if (!query?.sql || !activeConnection) return;

      const { clientId } = activeConnection;

      return trpc.sendQuery.query([clientId, query.sql]).then(([{ columns, rows }]) => {
        setQueries(
          (currentQueries) =>
            currentQueries.map((currentColumn) =>
              currentColumn.map((q) =>
                q.id === query.id ? { ...q, columns, hasResults: true, rows } : q,
              ),
            ),
          tabId,
        );
      });
    },
    [activeConnection, activeTab?.id, setQueries],
  );

  const addQuery = useCallback(
    async (
      addQueryOptions: AddQueryOptions,
      position?: { column: number; row?: number },
      tabId?: string,
    ) => {
      const newQuery = getNewQuery(addQueryOptions);

      setQueries((currentQueries) => {
        if (!position) {
          return [[newQuery]];
        }

        const { column, row } = position;

        const newQueries = currentQueries.map((column) => [...column]);

        if (!newQueries[column]) {
          newQueries[column] = [newQuery];
        } else {
          if (row !== undefined) {
            newQueries[column].splice(row, 0, newQuery);
          } else {
            newQueries.splice(column, 0, [newQuery]);
          }
        }

        return newQueries;
      }, tabId);

      await runQuery(newQuery.id, tabId);
    },
    [runQuery, setQueries],
  );

  const addTab = useCallback(
    (props: { query: AddQueryOptions }) => {
      const id = uniqueId();

      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id,
          queries: [],
        },
      ]);

      setActiveTabId(id);

      setTimeout(() => {
        addQuery(props.query, { column: 0, row: 0 }, id);
      });
    },
    [addQuery, setTabs],
  );

  const removeQuery = useCallback(
    (id: string) => {
      setQueries((currentQueries) =>
        currentQueries.map((c) => c.filter((q) => q.id !== id)).filter((c) => c.length),
      );
    },
    [setQueries],
  );

  const updateQuery = useCallback(
    async (id: string, sql: string) => {
      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => (q.id === id ? { ...q, sql, table: null } : q)),
        ),
      );

      await runQuery(id);
    },
    [runQuery, setQueries],
  );

  return useMemo(
    () => ({
      activeTab,
      addQuery,
      removeQuery,
      runQuery,
      updateQuery,
      addTab,
      setTabs,
      setActiveTabId,
      tabs,
    }),
    [activeTab, addQuery, addTab, removeQuery, runQuery, setTabs, tabs, updateQuery],
  );
};
