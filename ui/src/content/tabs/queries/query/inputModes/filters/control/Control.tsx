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

export interface FilterControlProps {
  filter: FormFilter;
  isFirst: boolean;
  removeFilter: () => void;
  updateFilter: (updateFn: (current: FormFilter) => FormFilter) => void;
}

export const FilterControl: React.FC<FilterControlProps> = (props) => {
  const { filter, isFirst, removeFilter, updateFilter } = props;

  const { columns } = useDefinedContext(ResultContext);
  assert(columns);

  const column = filter.column ? columns.find((col) => col.name === filter.column) : null;

  return (
    <div className="flex gap-2 pl-2">
      <div className="w-12 shrink-0 pl-1 pt-2 font-mono text-sm font-medium text-textTertiary">
        {isFirst ? 'WHERE' : filter.logicalOperator}
      </div>
      <Select
        htmlProps={{ className: '!w-[200px] shrink-0' }}
        onChange={(newColumn) => {
          updateFilter((current) => ({ ...current, column: newColumn }));
        }}
        options={columns.map((col) => ({ label: col.name, value: col.name }))}
        placeholder="Column"
        value={filter.column ?? null}
      />
      <Select
        htmlProps={{ className: '!w-[144px] shrink-0' }}
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
      {'value' in filter && column && !includes(NULL_OPERATORS, filter.operator) && (
        <ColumnField
          column={column}
          hideLabel
          htmlProps={{ className: '!w-[256px] shrink-0' }}
          onChange={(newValue) => {
            updateFilter((current) => ({
              ...current,
              value: newValue,
            }));
          }}
          placeholder="Value"
          value={filter.value === undefined ? '' : filter.value}
        />
      )}
      <Button
        htmlProps={{
          className: 'mr-1 mt-[6px]',
          onClick: removeFilter,
          type: 'button',
        }}
        color="secondary"
        icon={<Close />}
        size="small"
      />
    </div>
  );
};
