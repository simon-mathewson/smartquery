import React, { useCallback, useEffect, useRef } from 'react';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueriesContext } from '../../../Context';
import { QueryContext } from '../../Context';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';

export const Sql: React.FC = () => {
  const { updateQuery } = useDefinedContext(QueriesContext);

  const { query } = useDefinedContext(QueryContext);

  const valueStorageKey = `query-${query.id}-formSql`;
  const [value, setValue] = useStoredState<string>(
    valueStorageKey,
    query.sql ?? '',
    sessionStorage,
  );

  const valueRef = useRef(value);

  useEffect(() => {
    // Don't overwrite value if this is a draft query
    if (!query.sql) return;
    setValue(query.sql);
    valueRef.current = query.sql;
  }, [query.sql, setValue]);

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      valueRef.current = newValue;
    },
    [setValue],
  );

  const onSubmit = useCallback(
    () => updateQuery({ id: query.id, run: true, sql: valueRef.current }),
    [query.id, updateQuery],
  );

  return (
    <div className="px-2 pb-2">
      <SqlEditor onChange={onChange} onSubmit={onSubmit} value={value} />
    </div>
  );
};
