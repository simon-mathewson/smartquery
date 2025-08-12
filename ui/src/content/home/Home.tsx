import React from 'react';
import { Card } from '~/shared/components/card/Card';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Connections } from '../connections/Connections';
import { ConnectionsContext } from '../connections/Context';
import { WelcomeActions } from '../welcomeActions/WelcomeActions';

export const Home: React.FC = () => {
  const { connections } = useDefinedContext(ConnectionsContext);

  return (
    <Page htmlProps={{ className: 'max-w-[356px]' }} title="Home">
      {connections.length > 0 && (
        <Card htmlProps={{ className: 'flex flex-col p-3 w-full' }}>
          <Connections
            hideDatabases
            htmlProps={{ className: 'flex flex-col gap-2' }}
            shouldNavigate
          />
        </Card>
      )}
      <WelcomeActions />
    </Page>
  );
};
