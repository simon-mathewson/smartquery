import {
  LightbulbOutlined,
  PersonAddAlt1Outlined,
  ScienceOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { routes } from '~/router/routes';
import { ActionList } from '~/shared/components/actionList/ActionList';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import Add from '~/shared/icons/Add.svg?react';
import { AnalyticsContext } from '../analytics/Context';
import { AuthContext } from '../auth/Context';
import { ConnectionsContext } from '../connections/Context';

export type WelcomeActionsProps = {
  hideAddConnection?: boolean;
};

export const WelcomeActions: React.FC<WelcomeActionsProps> = (props) => {
  const { hideAddConnection } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);
  const { connections } = useDefinedContext(ConnectionsContext);

  const actions = useMemo(
    () => [
      {
        element: 'link' as const,
        hint: 'See how SmartQuery works with dummy data',
        icon: <ScienceOutlined />,
        label: 'Open demo database',
        htmlProps: {
          href: routes.demo(),
          onClick: () => {
            track('home_open_demo_database');
          },
        },
      },
      ...(!hideAddConnection && connections.length === 0
        ? [
            {
              element: 'link' as const,
              hint: 'Connect to your database',
              icon: <Add />,
              label: 'Add connection',
              htmlProps: {
                href: routes.addConnection(),
                onClick: () => track('home_add_connection'),
              },
            },
          ]
        : []),
      ...(!user
        ? [
            {
              element: 'link' as const,
              hint: 'Get free AI and cloud features',
              label: 'Sign up',
              icon: <PersonAddAlt1Outlined />,
              htmlProps: {
                href: routes.subscribePlans(),
                onClick: () => track('home_sign_up'),
              },
            },
            {
              element: 'link' as const,
              label: 'Log in',
              icon: <VpnKeyOutlined />,
              htmlProps: {
                href: routes.login(),
                onClick: () => track('home_log_in'),
              },
            },
          ]
        : []),
      ...(user && !user.activeSubscription
        ? [
            {
              element: 'link' as const,
              hint: 'Get access to all features',
              label: 'Subscribe',
              icon: <LightbulbOutlined />,
              htmlProps: {
                href: routes.subscribePlans(),
                onClick: () => track('home_subscribe'),
              },
            },
          ]
        : []),
    ],
    [connections.length, hideAddConnection, track, user],
  );

  return <ActionList actions={actions} />;
};
