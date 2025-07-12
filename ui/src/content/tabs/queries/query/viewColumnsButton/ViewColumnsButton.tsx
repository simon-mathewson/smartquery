import { Button } from '~/shared/components/button/Button';
import { ViewWeekOutlined } from '@mui/icons-material';
import { useCallback } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueryContext } from '../Context';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '~/content/connections/Context';
import { getSql } from './getSql';
import { QueriesContext } from '../../Context';

export const ViewColumnsButton: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

  const onClick = useCallback(() => {
    assert(query.select);
    assert(activeConnection);

    const sql = getSql({
      engine: activeConnection.engine,
      select: query.select,
      table: query.select.table,
    });

    addQuery({ sql }, { afterActiveTab: true });
  }, [activeConnection, addQuery, query.select]);

  if (!query.select) return null;

  return <Button htmlProps={{ onClick }} icon={<ViewWeekOutlined />} tooltip="View columns" />;
};
