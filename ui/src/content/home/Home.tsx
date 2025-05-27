import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '~/shared/components/card/Card';
import { Connections } from '../connections/Connections';
import { Logo } from '~/shared/components/logo/Logo';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { SqliteContext } from '../sqlite/Context';
import { sqliteDemoConnectionId } from './constants';
import { routes } from '~/router/routes';
import Add from '~/shared/icons/Add.svg?react';
import { ScienceOutlined, PersonAddAlt1Outlined, VpnKeyOutlined } from '@mui/icons-material';
import { ConnectionForm } from '../connections/form/ConnectionForm';
import { Signup } from '../auth/Signup';

export const Home: React.FC = () => {
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);

  const { storeSqliteContent } = useDefinedContext(SqliteContext);

  const [stage, setStage] = useState<'initial' | 'addConnection' | 'signup' | 'logIn'>('initial');

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

  const actions = useMemo(
    () => [
      {
        hint: 'See how Dabase works with dummy data',
        icon: ScienceOutlined,
        label: 'Open demo database',
        onClick: openDemoDatabase,
      },
      ...(connections.length === 0
        ? [
            {
              hint: 'Connect to your database',
              icon: Add,
              label: 'Add connection',
              onClick: () => setStage('addConnection'),
            },
          ]
        : []),
      {
        hint: 'Save your connections across devices',
        label: 'Sign up',
        icon: PersonAddAlt1Outlined,
        onClick: () => setStage('signup'),
      },
      {
        label: 'Log in',
        icon: VpnKeyOutlined,
        onClick: () => setStage('logIn'),
      },
    ],
    [connections.length, openDemoDatabase],
  );

  return (
    <div className="mx-auto flex w-[356px] flex-col items-center gap-6 py-8">
      <Logo htmlProps={{ className: 'w-16' }} />
      {connections.length > 0 && stage === 'initial' && (
        <Card htmlProps={{ className: 'flex flex-col p-3 w-full' }}>
          <Connections hideDatabases htmlProps={{ className: 'flex flex-col gap-2' }} />
        </Card>
      )}
      {stage === 'initial' && (
        <div className="flex w-full flex-col gap-3">
          {actions.map((action) => (
            <button
              className="hover:border-borderHover relative flex h-14 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4"
              key={action.label}
              onClick={action.onClick}
              tabIndex={0}
            >
              <action.icon className="absolute right-2 top-0 !h-[72px] !w-auto text-primaryHighlight" />
              <div className="flex flex-col items-start gap-[2px]">
                <div className="text-sm font-medium text-textPrimary">{action.label}</div>
                <div className="text-xs text-textTertiary">{action.hint}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {stage === 'addConnection' && (
        <Card htmlProps={{ className: 'flex flex-col p-3' }}>
          <ConnectionForm exit={() => setStage('initial')} />
        </Card>
      )}
      {stage === 'signup' && <Signup cancel={() => setStage('initial')} />}
    </div>
  );
};
