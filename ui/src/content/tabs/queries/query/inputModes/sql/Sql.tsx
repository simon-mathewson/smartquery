import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../../../Context';
import { QueryContext, ResultContext } from '../../Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AnalyticsContext } from '~/content/analytics/Context';
import { BookmarkAddedOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { assert } from 'ts-essentials';
import { ToastContext } from '~/content/toast/Context';
import { SavedQueriesContext } from '~/content/savedQueries/Context';

export const Sql: React.FC = () => {
  const toast = useDefinedContext(ToastContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);
  const { refetchSavedQueries } = useDefinedContext(SavedQueriesContext);
  const queryResult = useContext(ResultContext);

  const [value, setValue] = useStoredState<string>(
    `query-${query.id}-sql`,
    query.sql ?? '',
    sessionStorage,
  );
  const [isDraft, setIsDraft] = useStoredState<boolean>(
    `query-${query.id}-isDraft`,
    false,
    sessionStorage,
  );

  const valueRef = useRef(value);

  useEffect(() => {
    // Don't overwrite value if this is a draft query
    if (!query.sql || isDraft) return;
    setValue(query.sql);
    valueRef.current = query.sql;
  }, [query.sql, setValue, isDraft]);

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      valueRef.current = newValue;
    },
    [setValue],
  );

  const onKeyDown = useCallback(() => {
    setIsDraft(true);
  }, [setIsDraft]);

  const onSubmit = useCallback(async () => {
    track('query_sql_submit');

    await updateQuery({ id: query.id, run: true, sql: valueRef.current });

    setIsDraft(false);
  }, [query.id, updateQuery, track, setIsDraft]);

  const onReset = useCallback(() => {
    const sql = query.sql ?? '';
    setValue(sql);
    valueRef.current = sql;
    setIsDraft(false);
  }, [query.sql, setIsDraft, setValue]);

  const isSubmitDisabled = !isDraft && query.sql === value && queryResult !== null;

  const [isUpdatingSavedQuery, setIsUpdatingSavedQuery] = useState(false);

  const updateSavedQuery = useCallback(
    async (sql: string) => {
      assert(query.savedQueryId);

      setIsUpdatingSavedQuery(true);
      track('saved_query_update_sql');

      try {
        await cloudApi.savedQueries.update.mutate({ id: query.savedQueryId, sql });

        await refetchSavedQueries();
        await updateQuery({ id: query.id, sql });

        toast.add({
          color: 'success',
          title: 'Saved query updated',
        });
      } catch {
        toast.add({
          color: 'danger',
          title: 'Failed to update saved query',
        });
      } finally {
        setIsUpdatingSavedQuery(false);
      }
    },
    [cloudApi, query.id, query.savedQueryId, refetchSavedQueries, toast, track, updateQuery],
  );

  return (
    <div className="px-2 pb-2">
      <SqlEditor
        bottomToolbarActions={({ htmlProps, value }) =>
          query.savedQueryId &&
          value !== query.sql && (
            <Button
              icon={<BookmarkAddedOutlined />}
              label="Update saved query"
              htmlProps={{
                ...htmlProps,
                disabled: isUpdatingSavedQuery,
                onClick: () => {
                  void updateSavedQuery(value);
                },
              }}
            />
          )
        }
        extendOnFocus={queryResult !== null || Boolean(query.sql)}
        isResetDisabled={(query.sql ?? '') === value}
        isSubmitDisabled={isSubmitDisabled}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onReset={onReset}
        onSubmit={onSubmit}
        value={value}
      />
    </div>
  );
};
