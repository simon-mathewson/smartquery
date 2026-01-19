import { PlayArrowOutlined, Refresh } from '@mui/icons-material';
import { useContext, useEffect, useRef, useState } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Chart } from '~/content/charts/chart/Chart';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { BottomToolbar } from '~/content/tabs/queries/query/bottomToolbar/BottomToolbar';
import { QueryProvider } from '~/content/tabs/queries/query/Provider';
import { Table } from '~/content/tabs/queries/query/table/Table';
import { getNewQuery } from '~/content/tabs/queries/utils/getNewQuery';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Query } from '~/shared/types';
import type { CopilotQuery } from '../../../../types';
import { Tooltip } from '~/shared/components/tooltip/Tooltip';
import { CircularProgress } from '@mui/material';
import { QueryError } from '~/content/queries/QueryError';
import { useQueryResults } from './useQueryResults';

export type QueryResultsProps = {
  messageIndex: number;
  contentIndex: number;
  query: CopilotQuery;
};

export const QueryResults: React.FC<QueryResultsProps> = (props) => {
  const { messageIndex, contentIndex, query } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);

  const { isLoading, runQuery } = useQueryResults({
    copilotQuery: query,
    messageIndex,
    contentIndex,
  });

  const [parsedQuery, setParsedQuery] = useState<Query | null>(null);

  useEffect(() => {
    if (!activeConnectionContext) return;

    void getNewQuery({
      addQueryOptions: query,
      connection: activeConnectionContext.activeConnection,
    })
      .then((result) => {
        setParsedQuery(result);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [query, activeConnectionContext]);

  const handleRowCreationRef = useRef<(() => void) | null>(null);

  if (!query.result) {
    return (
      <Button
        htmlProps={{
          disabled: isLoading,
          className: 'pointer-events-auto w-full rounded-none',
          onClick: () => {
            track('copilot_run_query');
            void runQuery();
          },
        }}
        icon={<PlayArrowOutlined />}
        label="Run query"
      />
    );
  }

  const { result } = query;

  if (!parsedQuery) return null;

  return (
    <div className="relative flex h-full max-h-[40dvh] flex-col overflow-hidden">
      <QueryProvider query={parsedQuery} result={result}>
        <div className="flex items-center justify-between gap-2 pr-1">
          <div className="pointer-events-auto truncate pl-3 text-xs font-medium text-textTertiary">
            Results
          </div>
          <div className="relative h-fit w-fit">
            <Tooltip<HTMLButtonElement> text="Reload">
              {({ htmlProps }) => (
                <Button
                  color="secondary"
                  htmlProps={{
                    ...htmlProps,
                    onClick: () => {
                      track('copilot_reload_query');
                      void runQuery();
                    },
                  }}
                  icon={<Refresh />}
                />
              )}
            </Tooltip>
            {isLoading && (
              <CircularProgress
                className="pointer-events-none absolute left-[4px] top-[4px] !text-primary"
                size={28}
              />
            )}
          </div>
        </div>
        {result.error ? (
          <QueryError
            error={result.error}
            htmlProps={{ className: '!rounded-none pl-3 pr-1 py-1' }}
          />
        ) : (
          <>
            <div className="pl-2 pr-2 sm:pl-4">
              <Chart />
            </div>
            <Table
              canAdd={false}
              scrollOnlyOnFocus
              backgroundColor="control"
              disableSorting
              handleRowCreationRef={handleRowCreationRef}
              isEditable={false}
            />
            <div className="shrink-0 p-2 pl-2 sm:pl-4">
              <BottomToolbar
                canAdd={false}
                compact
                disablePagination
                handleRowCreationRef={handleRowCreationRef}
              />
            </div>
          </>
        )}
      </QueryProvider>
    </div>
  );
};
