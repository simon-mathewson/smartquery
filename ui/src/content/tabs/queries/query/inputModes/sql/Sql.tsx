import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../../../Context';
import { QueryContext, ResultContext } from '../../Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AnalyticsContext } from '~/content/analytics/Context';

export const Sql: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);
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

  return (
    <div className="px-2 pb-2">
      <SqlEditor
        compact={queryResult !== null}
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
