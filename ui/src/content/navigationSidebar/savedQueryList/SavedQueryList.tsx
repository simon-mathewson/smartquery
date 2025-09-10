import type { SavedQuery } from '@/savedQueries/types';
import classNames from 'classnames';
import React from 'react';
import { assert } from 'ts-essentials';
import { AuthContext } from '~/content/auth/Context';
import { Button } from '~/shared/components/button/Button';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import SearchIcon from '~/shared/icons/Search.svg?react';
import { useSavedQueryList } from './useSavedQueryList';

export const SavedQueryList: React.FC = () => {
  const { user } = useDefinedContext(AuthContext);
  assert(user);

  const {
    filteredSavedQueries,
    getHandleMouseDown,
    isDragging,
    isLoading,
    onSelect,
    search,
    selectedSavedQueries,
    setSearch,
  } = useSavedQueryList();

  if (isLoading) {
    return <Loading />;
  }

  if (!filteredSavedQueries?.length) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col gap-1 overflow-hidden py-2">
      <div className="flex items-center justify-between gap-2 pl-2">
        <div className="truncate text-xs font-medium text-textTertiary">Queries</div>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            htmlProps={{
              onClick: () => setSearch((search) => (search !== undefined ? undefined : '')),
            }}
            icon={<SearchIcon />}
            size="small"
            tooltip="Search queries"
            variant={search === undefined ? 'default' : 'highlighted'}
          />
        </div>
      </div>
      <List<SavedQuery>
        items={filteredSavedQueries.map((savedQuery) => ({
          className: classNames({
            '!opacity-50': isDragging,
          }),
          label: savedQuery.name,
          onMouseDown: getHandleMouseDown(savedQuery),
          selectedVariant: 'secondary',
          value: savedQuery,
        }))}
        multiple
        onSelect={onSelect}
        selectedValues={selectedSavedQueries}
        search={search}
        searchPlaceholder="Search queries"
        setSearch={setSearch}
        searchAutofocus
      />
    </div>
  );
};
