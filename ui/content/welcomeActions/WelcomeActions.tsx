import { ScienceOutlined } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { routes } from '~/router/routes';
import { ActionList } from '~/shared/components/actionList/ActionList';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import Add from '~/shared/icons/Add.svg?react';
import { AnalyticsContext } from '../analytics/Context';
import { ConnectionsContext } from '../connections/Context';

export type WelcomeActionsProps = {
  hideAddConnection?: boolean;
};

export const WelcomeActions: React.FC<WelcomeActionsProps> = (props) => {
  const { hideAddConnection } = props;

  const { track } = useDefinedContext(AnalyticsContext);
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
    ],
    [connections.length, hideAddConnection, track],
  );

  return <ActionList actions={actions} />;
};
