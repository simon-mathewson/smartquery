import React, { useCallback, useMemo } from 'react';
import { Card } from '~/shared/components/card/Card';
import { Connections } from '../connections/Connections';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { SqliteContext } from '../sqlite/Context';
import { sqliteDemoConnectionId } from './constants';
import { routes } from '~/router/routes';
import Add from '~/shared/icons/Add.svg?react';
import { ScienceOutlined, PersonAddAlt1Outlined, VpnKeyOutlined } from '@mui/icons-material';
import { Page } from '~/shared/components/page/Page';
import { Link } from 'wouter';
import { AuthContext } from '../auth/Context';
import { AnalyticsContext } from '../analytics/Context';

export const Home: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);
  const { connections, addConnection } = useDefinedContext(ConnectionsContext);
  const { storeSqliteContent } = useDefinedContext(SqliteContext);

  const openDemoDatabase = useCallback(async () => {
    const hasDemoConnection = connections.some(
      (connection) => connection.id === sqliteDemoConnectionId,
    );

    const routeParams = { connectionId: sqliteDemoConnectionId, database: 'demo', schema: '' };

    if (hasDemoConnection) {
      window.location.pathname = routes.connection(routeParams);
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
      storageLocation: 'local',
      type: 'file',
    });

    window.location.pathname = routes.connection(routeParams);

    track('home_open_demo_database');
  }, [addConnection, connections, storeSqliteContent, track]);

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
              route: routes.addConnection(),
              onClick: () => track('home_add_connection'),
            },
          ]
        : []),
      ...(!user
        ? [
            {
              hint: 'Save your connections across devices',
              label: 'Sign up',
              icon: PersonAddAlt1Outlined,
              route: routes.signup(),
              onClick: () => track('home_sign_up'),
            },
            {
              label: 'Log in',
              icon: VpnKeyOutlined,
              route: routes.login(),
              onClick: () => track('home_log_in'),
            },
          ]
        : []),
    ],
    [connections.length, openDemoDatabase, track, user],
  );

  return (
    <Page>
      {connections.length > 0 && (
        <Card htmlProps={{ className: 'flex flex-col p-3 w-full' }}>
          <Connections hideDatabases htmlProps={{ className: 'flex flex-col gap-2' }} />
        </Card>
      )}
      <div className="flex w-full flex-col gap-3">
        {actions.map((action) => {
          const Element = action.route ? Link : 'button';

          return (
            <Element
              className="relative flex h-14 cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 hover:border-borderHover"
              key={action.label}
              onClick={action.onClick}
              href={action.route as string}
              tabIndex={0}
            >
              <action.icon className="absolute right-2 top-0 !h-[72px] !w-auto text-primaryHighlight" />
              <div className="flex flex-col items-start gap-[2px]">
                <div className="text-sm font-medium text-textPrimary">{action.label}</div>
                <div className="text-xs text-textTertiary">{action.hint}</div>
              </div>
            </Element>
          );
        })}
      </div>
      {connections.length === 0 && (
        <div className="px-4 text-xs text-textTertiary">
          By using Dabase, you agree to the{' '}
          <a className="underline" href={import.meta.env.VITE_TERMS_URL} target="_blank">
            Terms of Use
          </a>{' '}
          and the{' '}
          <a className="underline" href={import.meta.env.VITE_PRIVACY_URL} target="_blank">
            Privacy Policy
          </a>
          .
        </div>
      )}
    </Page>
  );
};
