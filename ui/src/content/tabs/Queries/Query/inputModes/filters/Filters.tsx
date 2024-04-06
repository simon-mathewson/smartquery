import { Add, Send } from '@mui/icons-material';
import { includes } from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { NULL_OPERATORS } from './constants';
import { FilterControl } from './control/Control';
import type { Filter, FormFilter, LogicalOperator } from './types';
import { useFilters } from './useFilters';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueryContext } from '../../Context';

export const Filters: React.FC = () => {
  const { applyFilters, filters } = useFilters();

  const { query } = useDefinedContext(QueryContext);

  const formFiltersStorageKey = `query-${query.id}-formFilters`;
  const [formFilters, setFormFilters] = useStoredState<FormFilter[]>(
    formFiltersStorageKey,
    filters,
    sessionStorage,
  );

  const isChangedStorageKey = `query-${query.id}-isChanged`;
  const [isChanged, setIsChanged] = useStoredState(isChangedStorageKey, false, sessionStorage);

  useEffect(() => {
    if (isChanged) return;
    setFormFilters(filters);
  }, [filters, isChanged, setFormFilters]);

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
      setIsChanged(true);
    },
    [formFilters, setFormFilters, setIsChanged],
  );

  return (
    <form
      className="flex w-max flex-col gap-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        applyFilters(formFilters as Filter[]);
        setIsChanged(false);
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
              setIsChanged(true);
            }}
            updateFilter={(getNewFilter) => {
              setFormFilters((current) =>
                current.map((currentFilter) =>
                  currentFilter === filter ? getNewFilter(currentFilter) : currentFilter,
                ),
              );
              setIsChanged(true);
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
