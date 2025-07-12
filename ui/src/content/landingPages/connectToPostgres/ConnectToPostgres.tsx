import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { ConnectionForm } from '~/content/connections/form/ConnectionForm';
import { WelcomeActions } from '~/content/welcomeActions/WelcomeActions';
import { routes } from '~/router/routes';
import { Card } from '~/shared/components/card/Card';
import { Page } from '~/shared/components/page/Page';

export const ConnectToPostgres: React.FC = () => {
  const [, navigate] = useLocation();

  const title = 'Connect to Postgres';
  const description =
    'Connect to your Postgres database right from your browser and explore it with an intuitive UI and an AI copilot.';

  return (
    <>
      <Helmet>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>
      <Page title="Connect to Postgres">
        <Card htmlProps={{ className: 'w-full' }}>
          <ConnectionForm
            exit={() => {
              navigate(routes.root());
            }}
            overrideInitialValues={{ engine: 'postgres' }}
          />
        </Card>
        <WelcomeActions hideAddConnection />
      </Page>
    </>
  );
};
