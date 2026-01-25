import type { SavedQuery } from '@/savedQueries/types';
import classNames from 'classnames';
import React from 'react';
import { Button } from '~/shared/components/button/Button';
import type { ListProps } from '~/shared/components/list/List';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import SearchIcon from '~/shared/icons/Search.svg?react';
import { useSavedQueryList } from './useSavedQueryList';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export type SavedQueryListProps = {
  listVariant?: ListProps<unknown>['variant'];
  onSelect?: (savedQuery: SavedQuery) => void;
};

export const SavedQueryList: React.FC<SavedQueryListProps> = (props) => {
  const { listVariant } = props;

  const isMobile = useIsMobile();

  const {
    filteredSavedQueries,
    getHandleMouseDown,
    isDragging,
    isLoading,
    search,
    selectedSavedQueries,
    setSearch,
    ...savedQueryList
  } = useSavedQueryList();

  const onSelect = (savedQuery: SavedQuery) => {
    props.onSelect?.(savedQuery);
    savedQueryList.onSelect(savedQuery);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!search && !filteredSavedQueries?.length) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col gap-1 py-2">
      <div className="flex items-center justify-between gap-2 pl-2">
        <div
          className={classNames('truncate text-sm font-medium text-textSecondary sm:text-xs', {
            'text-textTertiary': listVariant === 'select',
          })}
        >
          Queries
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            htmlProps={{
              onClick: () => setSearch((search) => (search !== undefined ? undefined : '')),
            }}
            icon={<SearchIcon />}
            size={isMobile ? 'normal' : 'small'}
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
        variant={listVariant}
      />
    </div>
  );
};
