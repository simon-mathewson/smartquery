import React from 'react';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Connections } from '../connections/Connections';
import { ConnectionsContext } from '../connections/Context';
import { WelcomeActions } from '../welcomeActions/WelcomeActions';

export const Home: React.FC = () => {
  const { connections } = useDefinedContext(ConnectionsContext);

  return (
    <Page title="Home">
      {connections.length > 0 && (
        <Connections
          hideDatabases
          htmlProps={{ className: '!flex flex-col gap-2' }}
          shouldNavigate
        />
      )}
      <WelcomeActions />
    </Page>
  );
};
