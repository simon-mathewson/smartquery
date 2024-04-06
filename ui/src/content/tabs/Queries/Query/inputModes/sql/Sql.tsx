import React, { useEffect } from 'react';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
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

  useEffect(() => {
    // Don't overwrite value if this is a draft query
    if (!query.sql) return;
    setValue(query.sql);
  }, [query.sql, setValue]);

  return (
    <div className="px-2 pb-2">
      <SqlEditor
        onChange={setValue}
        onSubmit={() => updateQuery({ id: query.id, run: true, sql: value })}
        value={value}
      />
    </div>
  );
};
