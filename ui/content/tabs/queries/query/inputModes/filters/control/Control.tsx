import { includes } from 'lodash';
import React from 'react';
import { assert } from 'ts-essentials';
import { ColumnField } from '~/shared/components/columnField/ColumnField';
import { Select } from '~/shared/components/select/Select';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../../../Context';
import { NULL_OPERATORS, OPERATORS } from '../constants';
import type { FormFilter, NullOperator, OperatorWithValue } from '../types';
import { Close } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import type { ColumnRef } from '~/content/tabs/queries/utils/columnRefs';
import { compareColumnRefs, getColumnRef } from '~/content/tabs/queries/utils/columnRefs';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export interface FilterControlProps {
  filter: FormFilter;
  isFirst: boolean;
  removeFilter: () => void;
  updateFilter: (updateFn: (current: FormFilter) => FormFilter) => void;
}

export const FilterControl: React.FC<FilterControlProps> = (props) => {
  const { filter, isFirst, removeFilter, updateFilter } = props;

  const isMobile = useIsMobile();

  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const currentSchema =
    activeConnection.engine === 'postgres' ? activeConnection.schema : activeConnection.database;

  const { columns, tables } = useDefinedContext(ResultContext);
  assert(columns);

  const column = filter.columnRef
    ? columns.find((col) => compareColumnRefs(getColumnRef(col, currentSchema), filter.columnRef))
    : null;

  return (
    <div className="flex w-full gap-2 pl-2">
      <div className="w-12 shrink-0 pl-1 pt-2 font-mono text-sm font-medium text-textTertiary">
        {isFirst ? 'WHERE' : filter.logicalOperator}
      </div>
      <div className="grid w-full max-w-xl flex-col gap-2 sm:grid-cols-[repeat(3,1fr)] sm:grid-rows-1 sm:flex-row">
        <Select<ColumnRef | null>
          compareFn={compareColumnRefs}
          onChange={(newColumnRef) => {
            updateFilter((current) => ({ ...current, columnRef: newColumnRef }));
          }}
          options={columns
            /** Virtual columns are currently not supported. TODO: Add support via HAVING clause. */
            .filter((col) => col.isVisible && !col.isVirtual)
            .map((col) => ({
              label: col.table && tables.length > 1 ? `${col.table.name}.${col.name}` : col.name,
              value: getColumnRef(col, currentSchema),
            }))}
          placeholder="Column"
          value={filter.columnRef}
        />
        <Select
          monospace
          onChange={(newOperator) => {
            updateFilter((current) =>
              includes(NULL_OPERATORS, newOperator)
                ? { ...current, operator: newOperator as NullOperator }
                : {
                    ...current,
                    operator: newOperator as OperatorWithValue,
                    value: 'value' in current ? current.value : '',
                  },
            );
          }}
          options={OPERATORS.map((operator) => ({ label: operator, value: operator }))}
          value={filter.operator ?? null}
        />
        {'value' in filter && column && !includes(NULL_OPERATORS, filter.operator) ? (
          <ColumnField
            column={column}
            hideLabel
            onChange={(newValue) => {
              updateFilter((current) => ({
                ...current,
                value: newValue,
              }));
            }}
            placeholder="Value"
            value={filter.value === undefined ? '' : filter.value}
          />
        ) : (
          <div />
        )}
      </div>
      <Button
        htmlProps={{
          className: 'sm:mr-1 sm:mt-[6px] self-start sm:self-auto',
          onClick: removeFilter,
          type: 'button',
        }}
        color="secondary"
        icon={<Close />}
        size={isMobile ? undefined : 'small'}
        tooltip="Remove"
      />
    </div>
  );
};
