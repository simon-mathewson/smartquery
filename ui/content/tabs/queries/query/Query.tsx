import { Close, Refresh } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Chart } from '~/content/charts/chart/Chart';
import { ChartEditOverlay } from '~/content/charts/editOverlay/EditOverlay';
import { SavedQueryEditOverlay } from '~/content/savedQueries/editOverlay/EditOverlay';
import { Header } from '~/shared/components/header/Header';
import { Loading } from '~/shared/components/loading/Loading';
import { Tooltip } from '~/shared/components/tooltip/Tooltip';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { Button } from '../../../../shared/components/button/Button';
import { QueriesContext } from '../Context';
import { BottomToolbar } from './bottomToolbar/BottomToolbar';
import { QueryContext, ResultContext, SavedQueryContext } from './Context';
import { InputModes } from './inputModes/InputModes';
import { InputModesSelect } from './inputModes/Select';
import { Table } from './table/Table';
import type { InputMode } from './types';
import { getQueryTitle } from './utils';
import { ViewColumnsButton } from './viewColumnsButton/ViewColumnsButton';
import { getUniqueValues } from '../utils/getUniqueValues';
import { getUniqueColumns } from '../utils/getUniqueColumns';
import { QueryError } from '~/content/queries/QueryError';

export const Query: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { removeQuery, runUserQuery } = useDefinedContext(QueriesContext);
  const { columnIndex, query, rowIndex } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);
  const savedQuery = useContext(SavedQueryContext);

  const initialInputMode = query.initialInputMode ?? (!query.select ? 'editor' : undefined);

  const inputModeStorageKey = `query-${query.id}-inputMode`;
  const [inputMode, setInputMode] = useStoredState<InputMode | undefined>(
    inputModeStorageKey,
    initialInputMode,
    sessionStorage,
  );

  const handleRowCreationRef = React.useRef<(() => void) | null>(null);

  const isEditableBase = Boolean(
    result && result.tables?.length === 1 && result.tables?.[0].type === 'BASE TABLE',
  );

  const isEditable = Boolean(
    isEditableBase && result?.columns && getUniqueValues(result.columns, result.rows[0])?.length,
  );

  const canAdd = Boolean(
    isEditableBase && result?.columns && getUniqueColumns(result.columns).length,
  );

  return (
    <div
      className={classNames('relative ml-3 mt-3 flex h-full min-h-[100px] flex-col gap-2', {
        '!ml-0': columnIndex === 0,
        '!mt-0': rowIndex === 0,
      })}
      data-query={query.id}
    >
      <div className="space-y-2 pl-2 pr-2 sm:pl-3">
        <Header
          left={
            result ? <InputModesSelect inputMode={inputMode} setInputMode={setInputMode} /> : null
          }
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              {getQueryTitle(query, result, savedQuery)}
            </div>
          }
          right={
            <>
              <SavedQueryEditOverlay />
              {result && query.select && (
                <div className="relative h-fit w-fit">
                  <Tooltip<HTMLButtonElement> text="Reload">
                    {({ htmlProps }) => (
                      <Button
                        htmlProps={{
                          ...htmlProps,
                          onClick: () => {
                            void runUserQuery(query.id);
                            track('query_reload');
                          },
                        }}
                        icon={<Refresh />}
                      />
                    )}
                  </Tooltip>
                  {query.isLoading && (
                    <CircularProgress
                      className="pointer-events-none absolute left-[4px] top-[4px] !text-primary"
                      size={28}
                    />
                  )}
                </div>
              )}
              <Tooltip<HTMLButtonElement> text="Close">
                {({ htmlProps }) => (
                  <Button
                    color="secondary"
                    htmlProps={{
                      ...htmlProps,
                      onClick: () => {
                        removeQuery(query.id);
                        track('query_close');
                      },
                    }}
                    icon={<Close />}
                  />
                )}
              </Tooltip>
            </>
          }
        />
        <InputModes inputMode={inputMode} />
      </div>
      {result?.error && (
        <QueryError error={result.error} htmlProps={{ className: 'ml-4 mr-3 pl-4 pr-1' }} />
      )}
      {result && !('error' in result) && (
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          <div className="sticky top-0 z-30 flex gap-2 pb-2 pl-2 pr-2">
            <ChartEditOverlay />
            <ViewColumnsButton />
          </div>
          <div className="pl-2 pr-2 sm:pl-4">
            <Chart />
          </div>
          <Table
            handleRowCreationRef={handleRowCreationRef}
            isEditable={isEditable}
            canAdd={canAdd}
          />
          <div className="shrink-0 p-2 pl-2 sm:pl-4">
            <BottomToolbar handleRowCreationRef={handleRowCreationRef} canAdd={canAdd} />
          </div>
        </div>
      )}
      {!result && query.isLoading && (
        <div className="relative min-h-[100px]">
          <Loading />
        </div>
      )}
    </div>
  );
};
