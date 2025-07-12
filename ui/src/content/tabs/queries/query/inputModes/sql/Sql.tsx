import React, { useCallback, useEffect, useRef } from 'react';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../../../Context';
import { QueryContext } from '../../Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AnalyticsContext } from '~/content/analytics/Context';

export const Sql: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

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
      setIsDraft(true);
    },
    [setValue, setIsDraft],
  );

  const onSubmit = useCallback(async () => {
    track('query_sql_submit');

    await updateQuery({ id: query.id, run: true, sql: valueRef.current });

    setIsDraft(false);
  }, [query.id, updateQuery, track, setIsDraft]);

  return (
    <div className="px-2 pb-2">
      <SqlEditor
        isSubmitDisabled={!isDraft && query.sql === value}
        onChange={onChange}
        onSubmit={onSubmit}
        value={value}
      />
    </div>
  );
};
