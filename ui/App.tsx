import './index.css';

import React from 'react';
import { Helmet } from 'react-helmet';
import { ConsentModal } from './content/consentModal/ConsentModal';
import { Providers } from './providers/Providers';
import { Router } from './router/router';

export const App: React.FC = () => {
  const description =
    'AI-powered, browser-based database UI for Postgres, MySQL, and SQLite. Query, visualize, and modify your database using natural language. Get tailor-made queries from a schema-aware AI assistant. Insert, update, and delete with ease. Bring your data to life with charts. Ask your database anything. Intellisense and inline completions. Thoughtful, customizable design. Access your data from anywhere.';

  return (
    <>
      <Helmet>
        <title>SmartQuery</title>
        <meta name="description" content={description} />
      </Helmet>
      <Providers>
        <ConsentModal />
        <Router />
      </Providers>
    </>
  );
};
