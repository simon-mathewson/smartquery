import React from 'react';
import type { FormFilter, NullOperator, OperatorWithValue } from '../types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../../Context';
import { assert } from 'ts-essentials';
import { ColumnField } from '~/shared/components/ColumnField/ColumnField';
import { Select } from '~/shared/components/Select/Select';
import { NULL_OPERATORS, OPERATORS } from '../constants';
import { includes } from 'lodash';

export interface FilterControlProps {
  filter: FormFilter;
  updateFilter: (updateFn: (current: FormFilter) => FormFilter) => void;
}

export const FilterControl: React.FC<FilterControlProps> = (props) => {
  const { filter, updateFilter } = props;

  const { columns } = useDefinedContext(ResultContext);
  assert(columns);

  const column = filter.column ? columns.find((col) => col.name === filter.column) : null;

  return (
    <div className="flex gap-2">
      <Select
        className="w-[160px] flex-shrink-0"
        onChange={(newColumn) => {
          updateFilter((current) => ({ ...current, column: newColumn }));
        }}
        options={columns.map((col) => ({ label: col.name, value: col.name }))}
        placeholder="Column"
        value={filter.column ?? null}
      />
      <Select
        className="w-[144px]"
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
    </div>
  );
};
