import { BookmarkAddedOutlined } from '@mui/icons-material';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { AnalyticsContext } from '~/content/analytics/Context';
import { SavedQueriesContext } from '~/content/savedQueries/Context';
import { Button } from '~/shared/components/button/Button';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { QueriesContext } from '../../../Context';
import { QueryContext, ResultContext } from '../../Context';

export const Sql: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);
  const { updateSavedQuery } = useDefinedContext(SavedQueriesContext);
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

  const onOpdateSavedQuery = useCallback(
    async (sql: string) => {
      assert(query.savedQueryId);

      setIsUpdatingSavedQuery(true);

      await updateSavedQuery(query.savedQueryId, { sql }, query.id);

      setIsUpdatingSavedQuery(false);
    },
    [query.savedQueryId, updateSavedQuery, query.id],
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
                  void onOpdateSavedQuery(value);
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
