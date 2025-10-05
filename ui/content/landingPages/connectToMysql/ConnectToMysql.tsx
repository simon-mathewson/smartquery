import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { ConnectionForm } from '~/content/connections/form/ConnectionForm';
import { WelcomeActions } from '~/content/welcomeActions/WelcomeActions';
import { routes } from '~/router/routes';
import { Card } from '~/shared/components/card/Card';
import { Page } from '~/shared/components/page/Page';

export const ConnectToMysql: React.FC = () => {
  const [, navigate] = useLocation();

  const title = 'Connect to MySQL';
  const description =
    'Connect to your MySQL database right from your browser and explore it with an intuitive UI and an AI copilot.';

  return (
    <>
      <Helmet>
        <meta name="description" content={description} />
      </Helmet>
      <Page title={title}>
        <Card htmlProps={{ className: 'w-full' }}>
          <ConnectionForm
            exit={() => {
              navigate(routes.root());
            }}
            overrideInitialValues={{ engine: 'mysql' }}
          />
        </Card>
        <WelcomeActions hideAddConnection />
      </Page>
    </>
  );
};
