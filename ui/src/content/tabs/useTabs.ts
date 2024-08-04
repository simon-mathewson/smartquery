import { useCallback, useEffect, useMemo } from 'react';
import * as uuid from 'uuid';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { Query } from '~/shared/types';
import { type Tab } from '~/shared/types';
import { ConnectionsContext } from '../connections/Context';

export const useTabs = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const localStorageSuffix = activeConnection
    ? `${activeConnection.id}-${activeConnection.database}`
    : '';

  const [tabs, setTabs] = useStoredState<Tab[]>(`tabs-${localStorageSuffix}`, [], sessionStorage);

  const [activeTabId, setActiveTabId] = useStoredState<string | null>(
    `activeTabId-${localStorageSuffix}`,
    null,
    sessionStorage,
  );

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

  const addTab = useCallback(
    (queries: Query[][]) => {
      const id = uuid.v4();

      setTabs((currentTabs) => [...currentTabs, { id, queries }]);
      setActiveTabId(id);
    },
    [setActiveTabId, setTabs],
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
