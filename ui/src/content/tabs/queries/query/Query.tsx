import { Close, Refresh } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ChartEditOverlay } from '~/content/charts/editOverlay/EditOverlay';
import { LineChart } from '~/content/charts/lineChart/LineChart';
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

  return (
    <div
      className={classNames(
        'relative ml-3 mt-3 flex min-h-[240px] flex-col rounded-xl border border-border bg-card',
        {
          '!ml-0': columnIndex === 0,
          '!mt-0': rowIndex === 0,
        },
      )}
      data-query={query.id}
    >
      <div className="space-y-2 p-2">
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
                      className="absolute left-[4px] top-[4px] !text-primary"
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
      {result && (
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="sticky top-0 z-10 flex gap-2 bg-card px-2 pb-3">
            <ChartEditOverlay />
            <ViewColumnsButton />
          </div>
          <LineChart />
          <Table handleRowCreationRef={handleRowCreationRef} />
          <div className="p-2">
            <BottomToolbar handleRowCreationRef={handleRowCreationRef} />
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
