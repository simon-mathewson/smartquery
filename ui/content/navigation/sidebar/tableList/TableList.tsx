import classNames from 'classnames';
import React from 'react';
import type { ListProps } from '~/shared/components/list/List';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import type { Table } from './useTableList';
import { useTableList } from './useTableList';
import { Button } from '~/shared/components/button/Button';
import SearchIcon from '~/shared/icons/Search.svg?react';
import { RefreshOutlined } from '@mui/icons-material';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export type TableListProps = {
  listVariant?: ListProps<unknown>['variant'];
  onSelect?: () => void;
};

export const TableList: React.FC<TableListProps> = (props) => {
  const { listVariant } = props;

  const isMobile = useIsMobile();

  const {
    filteredTables,
    getHandleMouseDown,
    isDragging,
    isLoading,
    isLoadingDatabases,
    search,
    selectedTables,
    setSearch,
    refreshTables,
    ...tableList
  } = useTableList();

  const onSelect = (table: Table) => {
    props.onSelect?.();
    tableList.onSelect(table);
  };

  return (
    <div className="flex w-full flex-col gap-1 py-2">
      <div className="flex items-center justify-between gap-2 pl-2">
        <div
          className={classNames('truncate text-sm font-medium text-textSecondary sm:text-xs', {
            'text-textTertiary': listVariant === 'select',
          })}
        >
          Tables
        </div>
        <div className="flex items-center gap-1">
          <Button
            color="secondary"
            htmlProps={{
              onClick: () => refreshTables(),
            }}
            icon={<RefreshOutlined />}
            size={isMobile ? 'normal' : 'small'}
            tooltip="Refresh tables"
          />
          <Button
            color="secondary"
            htmlProps={{
              onClick: () => setSearch((search) => (search !== undefined ? undefined : '')),
            }}
            icon={<SearchIcon />}
            size={isMobile ? 'normal' : 'small'}
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
            variant={listVariant}
          />
        )}
      </div>
    </div>
  );
};
