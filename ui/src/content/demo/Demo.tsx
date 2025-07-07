import React from 'react';
import { routes } from '~/router/routes';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { AnalyticsContext } from '../analytics/Context';
import { ConnectionsContext } from '../connections/Context';
import { SqliteContext } from '../sqlite/Context';
import { sqliteDemoConnectionId } from './constants';

export const Demo: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);
  const { storeSqliteContent } = useDefinedContext(SqliteContext);

  useEffectOnce(() => {
    const hasDemoConnection = connections.some(
      (connection) => connection.id === sqliteDemoConnectionId,
    );

    const routeParams = { connectionId: sqliteDemoConnectionId, database: 'demo', schema: '' };

    if (hasDemoConnection) {
      window.location.replace(routes.connection(routeParams));
      return;
    }

    void fetch('/demo.sqlite')
      .then((response) => response.arrayBuffer())
      .then((buffer) => storeSqliteContent(buffer, sqliteDemoConnectionId))
      .then(() => {
        addConnection({
          database: 'demo',
          engine: 'sqlite',
          id: sqliteDemoConnectionId,
          name: 'Demo',
          storageLocation: 'local',
          type: 'file',
        });

        window.location.pathname = routes.connection(routeParams);

        track('home_open_demo_database');
      });
  });

  return <Loading />;
};
