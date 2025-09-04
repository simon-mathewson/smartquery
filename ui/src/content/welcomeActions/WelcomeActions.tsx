import {
  LightbulbOutlined,
  PersonAddAlt1Outlined,
  ScienceOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { routes } from '~/router/routes';
import type { Action } from '~/shared/components/actionList/ActionList';
import { ActionList } from '~/shared/components/actionList/ActionList';
import Add from '~/shared/icons/Add.svg?react';
import { ConnectionsContext } from '../connections/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { AnalyticsContext } from '../analytics/Context';

export type WelcomeActionsProps = {
  hideAddConnection?: boolean;
};

export const WelcomeActions: React.FC<WelcomeActionsProps> = (props) => {
  const { hideAddConnection } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);
  const { connections } = useDefinedContext(ConnectionsContext);

  const actions = useMemo(
    () =>
      [
        {
          hint: 'See how SmartQuery works with dummy data',
          icon: ScienceOutlined,
          label: 'Open demo database',
          route: routes.demo(),
          onClick: () => {
            track('home_open_demo_database');
          },
        },
        ...(!hideAddConnection && connections.length === 0
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
                hint: 'Get free AI and cloud features',
                label: 'Sign up',
                icon: PersonAddAlt1Outlined,
                route: routes.subscribePlans(),
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
        ...(user && !user.activeSubscription
          ? [
              {
                hint: 'Get access to all features',
                label: 'Subscribe',
                icon: LightbulbOutlined,
                route: routes.subscribePlans(),
                onClick: () => track('home_subscribe'),
              },
            ]
          : []),
      ] satisfies Action[],
    [connections.length, hideAddConnection, track, user],
  );

  return <ActionList actions={actions} />;
};
