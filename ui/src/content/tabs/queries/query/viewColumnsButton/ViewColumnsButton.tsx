import { Button } from '~/shared/components/button/Button';
import { ViewWeekOutlined } from '@mui/icons-material';
import { useCallback } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueryContext } from '../Context';
import { assert } from 'ts-essentials';
import { getSql } from './getSql';
import { QueriesContext } from '../../Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';

export const ViewColumnsButton: React.FC = () => {
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

  const onClick = useCallback(async () => {
    assert(query.select);

    const sql = await getSql({
      engine: activeConnection.engine,
      select: query.select,
      table: query.select.table,
    });

    void addQuery({ sql }, { afterActiveTab: true, run: true });
  }, [activeConnection, addQuery, query.select]);

  if (!query.select) return null;

  return <Button htmlProps={{ onClick }} icon={<ViewWeekOutlined />} tooltip="View columns" />;
};
