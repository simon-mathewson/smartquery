import { Add, Send } from '@mui/icons-material';
import { includes, isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { NULL_OPERATORS } from './constants';
import { FilterControl } from './control/Control';
import type { Filter, FormFilter, LogicalOperator } from './types';
import { useFilters } from './useFilters';

export const Filters: React.FC = () => {
  const { applyFilters, filters } = useFilters();

  const [formFilters, setFormFilters] = useState<FormFilter[]>(filters);

  const isChanged = useMemo(() => !isEqual(filters, formFilters), [filters, formFilters]);

  useEffect(() => {
    setFormFilters(filters);
  }, [filters, setFormFilters]);

  const isValid = formFilters.every(
    (filter) =>
      filter.column &&
      filter.operator &&
      (includes(NULL_OPERATORS, filter.operator) || 'value' in filter),
  );

  const addFilter = useCallback(
    (logicalOperator: LogicalOperator) => {
      setFormFilters([
        ...formFilters,
        {
          column: null,
          logicalOperator,
          operator: '=',
          value: '',
        },
      ]);
    },
    [formFilters, setFormFilters],
  );

  return (
    <form
      className="flex w-max flex-col gap-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        applyFilters(formFilters as Filter[]);
      }}
    >
      {formFilters.map((filter, index) => (
        <div className="flex items-center gap-2" key={index}>
          <FilterControl
            filter={filter}
            isFirst={index === 0}
            removeFilter={() => {
              setFormFilters((current) =>
                current.filter((currentFilter) => currentFilter !== filter),
              );
            }}
            updateFilter={(getNewFilter) => {
              setFormFilters((current) =>
                current.map((currentFilter) =>
                  currentFilter === filter ? getNewFilter(currentFilter) : currentFilter,
                ),
              );
            }}
          />
          {index === formFilters.length - 1 && isChanged && (
            <Button
              color="primary"
              disabled={!isValid}
              icon={<Send />}
              type="submit"
              variant="filled"
            />
          )}
        </div>
      ))}
      {formFilters.length === 0 && isChanged && (
        <div className="pl-2">
          <Button
            color="primary"
            disabled={!isValid}
            icon={<Send />}
            type="submit"
            variant="filled"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          icon={<Add />}
          label={formFilters.length === 0 ? 'WHERE' : 'AND'}
          onClick={() => addFilter('AND')}
          monospace
          size="small"
          type="button"
        />
        {formFilters.length > 0 && (
          <Button
            icon={<Add />}
            label="OR"
            onClick={() => addFilter('OR')}
            monospace
            size="small"
            type="button"
          />
        )}
      </div>
    </form>
  );
};
