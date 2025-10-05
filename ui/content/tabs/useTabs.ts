import { useCallback, useContext, useEffect, useMemo } from 'react';
import * as uuid from 'uuid';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { Query } from '~/shared/types';
import { type Tab } from '~/shared/types';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';

export const useTabs = () => {
  const activeConnectionContext = useContext(ActiveConnectionContext);

  const localStorageSuffix = activeConnectionContext
    ? `${activeConnectionContext.activeConnection.id}-${activeConnectionContext.activeConnection.database}`
    : null;
  const tabsStorageKey = localStorageSuffix ? `tabs-${localStorageSuffix}` : null;
  const activeTabIdStorageKey = localStorageSuffix ? `activeTabId-${localStorageSuffix}` : null;

  const [tabs, setTabs] = useStoredState<Tab[]>(tabsStorageKey, [], sessionStorage, [
    (tabs) =>
      tabs.map((t) => ({
        ...t,
        queries: t.queries.map((qs) =>
          qs.map((q) => {
            const tableName = (q.select as unknown as { table: string } | null)?.table;

            return {
              ...q,
              select:
                q.select && tableName
                  ? {
                      ...q.select,
                      tables:
                        !('tables' in q.select) || !q.select.tables
                          ? [{ name: tableName, originalName: tableName }]
                          : q.select.tables,
                    }
                  : q.select,
            };
          }),
        ),
      })),
  ]);

  const [activeTabId, setActiveTabId] = useStoredState<string | null>(
    activeTabIdStorageKey,
    null,
    sessionStorage,
  );

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

  const addTab = useCallback(
    (queries: Query[][], options?: { afterActive?: boolean; openIfExists?: boolean }) => {
      const { afterActive, openIfExists } = options ?? {};

      if (openIfExists) {
        const existingTab = tabs.find((t) =>
          t.queries.every((c, columnIndex) =>
            c.every((q, rowIndex) => {
              if (queries[columnIndex][rowIndex].savedQueryId) {
                return q.savedQueryId === queries[columnIndex][rowIndex].savedQueryId;
              }

              return q.sql === queries[columnIndex][rowIndex].sql;
            }),
          ),
        );
        if (existingTab) {
          setActiveTabId(existingTab.id);
          return;
        }
      }

      const id = uuid.v4();

      setTabs((currentTabs) => {
        const newIndex = afterActive
          ? currentTabs.findIndex((t) => t.id === activeTabId) + 1
          : currentTabs.length;

        const newTabs = [...currentTabs];
        newTabs.splice(newIndex, 0, { id, queries });
        return newTabs;
      });
      setActiveTabId(id);
    },
    [activeTabId, setActiveTabId, setTabs, tabs],
  );

  const removeTab = useCallback(
    (id: string) => {
      setTabs((currentTabs) => currentTabs.filter((t) => t.id !== id));
    },
    [setTabs],
  );

  useEffect(() => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) {
      setActiveTabId(null);
    }
    if (!activeTabId && tabs.length) {
      setActiveTabId(tabs[0].id);
    }
  }, [activeTabId, setActiveTabId, tabs]);

  return useMemo(
    () => ({
      activeTab,
      addTab,
      removeTab,
      setActiveTabId,
      setTabs,
      tabs,
    }),
    [activeTab, addTab, removeTab, setActiveTabId, setTabs, tabs],
  );
};
