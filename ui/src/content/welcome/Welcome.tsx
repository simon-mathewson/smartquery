import { ArrowForward } from '@mui/icons-material';
import { useCallback } from 'react';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Logo } from '~/shared/components/logo/Logo';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { sqliteDemoConnectionId } from './constants';
import { SqliteContext } from '../sqlite/Context';
import { Connections } from '../connections/Connections';

export const Welcome: React.FC = () => {
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);

  const { storeSqliteContent } = useDefinedContext(SqliteContext);

  const openDemoDatabase = useCallback(async () => {
    const hasDemoConnection = connections.some(
      (connection) => connection.id === sqliteDemoConnectionId,
    );

    const routeParams = { connectionId: sqliteDemoConnectionId, database: 'demo', schema: '' };

    if (hasDemoConnection) {
      window.location.pathname = routes.database(routeParams);
      return;
    }

    const response = await fetch('/demo.sqlite');
    const buffer = await response.arrayBuffer();
    await storeSqliteContent(buffer, sqliteDemoConnectionId);

    addConnection({
      database: 'demo',
      engine: 'sqlite',
      id: sqliteDemoConnectionId,
      name: 'Demo',
      type: 'file',
    });

    window.location.pathname = routes.database(routeParams);
  }, [addConnection, connections, storeSqliteContent]);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <Logo htmlProps={{ className: 'w-16' }} />
      <Card htmlProps={{ className: 'flex w-[352px] flex-col gap-3 p-4' }}>
        <div className="text-center text-lg font-medium text-textSecondary">Welcome to Dabase!</div>
        <div className="text-sm leading-snug text-textSecondary">
          To see how Dabase works, check out the demo database:
        </div>
        <Button
          htmlProps={{ onClick: openDemoDatabase }}
          icon={<ArrowForward />}
          label="Open demo database"
          variant="filled"
        />
      </Card>
      <Card htmlProps={{ className: 'flex w-[352px] flex-col gap-3 p-4' }}>
        <Connections hideDatabases htmlProps={{ className: 'w-full' }} />
      </Card>
    </div>
  );
};
