import React, { useCallback, useRef } from 'react';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../../../Context';
import { QueryContext } from '../../Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const Sql: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

  const valueStorageKey = `query-${query.id}-formSql`;
  const [value, setValue] = useStoredState<string>(
    valueStorageKey,
    query.sql ?? '',
    sessionStorage,
  );

  const valueRef = useRef(value);

  // Set value to query.sql unless user has entered query
  useEffectOnce(() => {
    if (!value.trim() && query.sql) {
      setValue(query.sql);
      valueRef.current = query.sql;
    }
  });

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      valueRef.current = newValue;
    },
    [setValue],
  );

  const onSubmit = useCallback(async () => {
    track('query_sql_submit');

    await updateQuery({ id: query.id, run: true, sql: valueRef.current });
  }, [query.id, updateQuery, track]);

  return (
    <div className="px-2 pb-2">
      <SqlEditor onChange={onChange} onSubmit={onSubmit} value={value} />
    </div>
  );
};
