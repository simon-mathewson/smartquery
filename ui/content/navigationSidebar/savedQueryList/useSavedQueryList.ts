import type { SavedQuery } from '@/savedQueries/types';
import { uniq } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useDrag } from '~/content/dragAndDrop/useDrag/useDrag';
import { SavedQueriesContext } from '~/content/savedQueries/Context';
import { TabsContext } from '~/content/tabs/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { NavigationSidebarContext } from '../Context';

export const useSavedQueryList = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeTab } = useDefinedContext(TabsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const { savedQueries, isLoading } = useDefinedContext(SavedQueriesContext);
  const navigationSidebar = useDefinedContext(NavigationSidebarContext);

  const selectedSavedQueries = uniq(
    activeTab?.queries.flatMap((queries) =>
      queries
        .flatMap((query) =>
          query.savedQueryId
            ? savedQueries?.find((savedQuery) => savedQuery.id === query.savedQueryId)
            : undefined,
        )
        .filter(isNotUndefined),
    ),
  );

  const { getHandleMouseDown, isDragging } = useDrag<SavedQuery>({
    onDrop: (dropProps) => {
      const {
        item: savedQuery,
        dropMarker: { column, horizontal, row },
      } = dropProps;

      assert(activeTab);

      void addQuery(
        { sql: savedQuery.sql, savedQueryId: savedQuery.id },
        {
          position: { column, row: horizontal ? row : undefined },
          tabId: activeTab.id,
        },
      );

      track('saved_query_list_drag_drop');
    },
  });

  const [search, setSearch] = useState<string | undefined>(undefined);

  const filteredSavedQueries = useMemo(() => {
    if (!search?.trim()) return savedQueries;

    return (
      savedQueries?.filter((savedQuery) =>
        savedQuery.name.toLowerCase().includes(search.trim().toLowerCase()),
      ) ?? []
    );
  }, [search, savedQueries]);

  const onSelect = useCallback(
    (savedQuery: SavedQuery) => {
      void addQuery(
        { sql: savedQuery.sql, savedQueryId: savedQuery.id, chart: savedQuery.chart },
        {
          // Unless saved query is already selected, open tab that already contains this query if
          // applicable
          openIfExists: !selectedSavedQueries.some((s) => s.id === savedQuery.id),
        },
      );

      track('saved_query_list_select');

      navigationSidebar.setIsOpen(false);
    },
    [addQuery, navigationSidebar, selectedSavedQueries, track],
  );

  return useMemo(
    () => ({
      filteredSavedQueries,
      getHandleMouseDown,
      isDragging,
      isLoading,
      onSelect,
      search,
      selectedSavedQueries,
      setSearch,
    }),
    [
      filteredSavedQueries,
      getHandleMouseDown,
      isDragging,
      isLoading,
      onSelect,
      search,
      selectedSavedQueries,
      setSearch,
    ],
  );
};
