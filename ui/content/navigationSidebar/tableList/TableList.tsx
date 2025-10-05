import classNames from 'classnames';
import React from 'react';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import type { Table } from './useTableList';
import { useTableList } from './useTableList';
import { Button } from '~/shared/components/button/Button';
import SearchIcon from '~/shared/icons/Search.svg?react';

export const TableList: React.FC = () => {
  const {
    filteredTables,
    getHandleMouseDown,
    isDragging,
    isLoading,
    isLoadingDatabases,
    onSelect,
    search,
    selectedTables,
    setSearch,
  } = useTableList();

  return (
    <div className="flex w-full flex-col gap-1 py-2">
      <div className="flex items-center justify-between gap-2 pl-2">
        <div className="truncate text-xs font-medium text-textTertiary">Tables</div>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            htmlProps={{
              onClick: () => setSearch((search) => (search !== undefined ? undefined : '')),
            }}
            icon={<SearchIcon />}
            size="small"
            tooltip="Search tables"
            variant={search === undefined ? 'default' : 'highlighted'}
          />
        </div>
      </div>
      <div className="relative flex min-h-[100px] flex-col overflow-hidden">
        {isLoading || isLoadingDatabases ? (
          <Loading />
        ) : (
          <List<Table>
            emptyPlaceholder="This database is empty."
            items={filteredTables.map((table) => ({
              className: classNames({
                '!opacity-50': isDragging,
              }),
              label: table.name,
              onMouseDown: getHandleMouseDown(table),
              selectedVariant: 'secondary',
              value: table,
            }))}
            multiple
            onSelect={onSelect}
            selectedValues={selectedTables}
            search={search}
            searchPlaceholder="Search tables"
            setSearch={setSearch}
            searchAutofocus
          />
        )}
      </div>
    </div>
  );
};
