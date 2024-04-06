import { Add, Send } from '@mui/icons-material';
import { includes } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { NULL_OPERATORS } from './constants';
import { FilterControl } from './control/Control';
import type { Filter, FormFilter } from './types';
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
  const [isChanged, setIsChanged] = useState(false);

  const isValid = formFilters.every(
    (filter) =>
      filter.column &&
      filter.operator &&
      (includes(NULL_OPERATORS, filter.operator) || 'value' in filter),
  );

  const addFilter = useCallback(() => {
    setFormFilters([...formFilters, { column: null, operator: '=', value: '' }]);
    setIsChanged(true);
  }, [formFilters, setFormFilters]);

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
      <div>
        <Button
          icon={<Add />}
          label={formFilters.length === 0 ? 'WHERE' : 'AND'}
          onClick={addFilter}
          monospace
          size="small"
          type="button"
        />
      </div>
    </form>
  );
};
