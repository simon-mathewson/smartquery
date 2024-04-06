import { includes } from 'lodash';
import React from 'react';
import { assert } from 'ts-essentials';
import { ColumnField } from '~/shared/components/ColumnField/ColumnField';
import { Select } from '~/shared/components/Select/Select';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../../Context';
import { NULL_OPERATORS, OPERATORS } from '../constants';
import type { FormFilter, NullOperator, OperatorWithValue } from '../types';
import { Close } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';

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
    <div className="flex items-center gap-2 pl-2">
      <div className="w-12 shrink-0 pl-1 font-mono text-sm font-medium text-textTertiary">
        {isFirst ? 'WHERE' : filter.logicalOperator}
      </div>
      <Select
        className="!w-[200px] shrink-0"
        onChange={(newColumn) => {
          updateFilter((current) => ({ ...current, column: newColumn }));
        }}
        options={columns.map((col) => ({ label: col.name, value: col.name }))}
        placeholder="Column"
        value={filter.column ?? null}
      />
      <Select
        className="!w-[144px] shrink-0"
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
          className="!w-[256px] shrink-0"
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
      )}
      <Button
        color="secondary"
        icon={<Close />}
        onClick={removeFilter}
        size="small"
        type="button"
      />
    </div>
  );
};
