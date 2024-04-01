import { includes } from 'lodash';
import { Add, ArrowForward } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useFilters } from './useFilters';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../Context';
import type { Filter } from './types';
import { NULL_OPERATORS } from './constants';

export const Filters: React.FC = () => {
  const result = useDefinedContext(ResultContext);

  const { applyFilters, filters } = useFilters();

  const [formFilters, setFormFilters] = useState<Array<Partial<Filter>>>(filters);
  const [isChanged, setIsChanged] = useState(false);

  const isValid = formFilters.every(
    (filter) =>
      filter.column &&
      filter.operator &&
      (includes(NULL_OPERATORS, filter.operator) || 'value' in filter),
  );

  const addFilter = useCallback(() => {
    setFormFilters([...formFilters, {}]);
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
