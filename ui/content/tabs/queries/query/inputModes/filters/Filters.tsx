import { Add, Send } from '@mui/icons-material';
import { includes, isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { NULL_OPERATORS } from './constants';
import { FilterControl } from './control/Control';
import type { Filter, FormFilter, LogicalOperator } from './types';
import { useFilters } from './useFilters';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '~/content/analytics/Context';

export const Filters: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);

  const { applyFilters, filters } = useFilters();

  const [formFilters, setFormFilters] = useState<FormFilter[]>(filters);

  const isChanged = useMemo(() => !isEqual(filters, formFilters), [filters, formFilters]);

  useEffect(() => {
    setFormFilters(filters);
  }, [filters, setFormFilters]);

  const isValid = formFilters.every(
    (filter) =>
      filter.columnRef &&
      filter.operator &&
      (includes(NULL_OPERATORS, filter.operator) || 'value' in filter),
  );

  const addFilter = useCallback(
    (logicalOperator: LogicalOperator) => {
      setFormFilters([
        ...formFilters,
        {
          columnRef: null,
          logicalOperator,
          operator: '=',
          value: '',
        },
      ]);

      track('query_filters_add', { logical_operator: logicalOperator });
    },
    [formFilters, setFormFilters, track],
  );

  return (
    <form
      className="flex flex-col gap-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        void applyFilters(formFilters as Filter[]);

        track('query_filters_submit');
      }}
    >
      {formFilters.map((filter, index) => (
        <div className="flex gap-4 sm:gap-2" key={index}>
          <FilterControl
            filter={filter}
            isFirst={index === 0}
            removeFilter={() => {
              setFormFilters((current) =>
                current.filter((currentFilter) => currentFilter !== filter),
              );

              track('query_filters_remove');
            }}
            updateFilter={(getNewFilter) => {
              setFormFilters((current) =>
                current.map((currentFilter) =>
                  currentFilter === filter ? getNewFilter(currentFilter) : currentFilter,
                ),
              );

              track('query_filters_update');
            }}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          htmlProps={{
            onClick: () => addFilter('AND'),
            type: 'button',
          }}
          icon={<Add />}
          label={formFilters.length === 0 ? 'WHERE' : 'AND'}
          monospace
          size="small"
        />
        {formFilters.length > 0 && (
          <Button
            htmlProps={{
              onClick: () => addFilter('OR'),
              type: 'button',
            }}
            icon={<Add />}
            label="OR"
            monospace
            size="small"
          />
        )}
        {isChanged && (
          <Button
            color="primary"
            htmlProps={{ className: 'ml-auto w-36', disabled: !isValid, type: 'submit' }}
            icon={<Send />}
            variant="filled"
            label="Submit"
          />
        )}
      </div>
    </form>
  );
};
