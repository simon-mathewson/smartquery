import { useCallback, useContext, useState } from 'react';
import { assert } from 'ts-essentials';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { getNewQuery } from '~/content/tabs/queries/utils/getNewQuery';
import { ToastContext } from '~/content/toast/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../../../../Context';
import type { CopilotQuery } from '../../../../types';

export type UseQueryResultsProps = {
  copilotQuery: CopilotQuery;
  messageIndex: number;
  contentIndex: number;
};

export const useQueryResults = (props: UseQueryResultsProps) => {
  const { copilotQuery, messageIndex, contentIndex } = props;

  const toast = useDefinedContext(ToastContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);
  const { setQueryResult } = useDefinedContext(CopilotContext);

  const [isLoading, setIsLoading] = useState(false);

  const runQuery = useCallback(async () => {
    assert(activeConnectionContext);
    const { runUserQuery } = activeConnectionContext;

    setIsLoading(true);

    try {
      const query = await getNewQuery({
        addQueryOptions: copilotQuery,
        connection: activeConnectionContext.activeConnection,
      });

      const result = await runUserQuery(query);

      if (!result) {
        toast.add({
          color: 'success',
          description: 'No results returned',
          title: 'Query successful',
        });
        return;
      }

      setQueryResult(messageIndex, contentIndex, result);
    } catch (error) {
      setQueryResult(messageIndex, contentIndex, {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeConnectionContext, copilotQuery, setQueryResult, messageIndex, contentIndex, toast]);

  return {
    isLoading,
    runQuery,
  };
};
