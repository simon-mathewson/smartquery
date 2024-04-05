import { Add, ArrowForward } from '@mui/icons-material';
import { includes } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { NULL_OPERATORS } from './constants';
import { FilterControl } from './control/Control';
import type { Filter, FormFilter } from './types';
import { useFilters } from './useFilters';

export const Filters: React.FC = () => {
  const { applyFilters, filters } = useFilters();

  const [formFilters, setFormFilters] = useState<FormFilter[]>(filters);
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
  }, [formFilters]);

  return (
    <form
      className="flex items-center gap-2 px-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        applyFilters(formFilters as Filter[]);
        setIsChanged(false);
      }}
    >
      {formFilters.length === 0 && (
        <Button
          color="secondary"
          icon={<Add />}
          label="WHERE"
          onClick={addFilter}
          monospace
          type="button"
        />
      )}
      {formFilters.map((filter, index) => (
        <FilterControl
          filter={filter}
          key={index}
          updateFilter={(getNewFilter) => {
            setFormFilters((current) =>
              current.map((currentFilter) =>
                currentFilter === filter ? getNewFilter(currentFilter) : currentFilter,
              ),
            );
            setIsChanged(true);
          }}
        />
      ))}
      {isChanged && (
        <Button
          color="primary"
          disabled={!isValid}
          icon={<ArrowForward />}
          size="small"
          type="submit"
          variant="filled"
        />
      )}
    </form>
  );
};
