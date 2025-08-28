import './index.css';

import React from 'react';
import { Footer } from './content/footer/Footer';
import { Providers } from './providers/Providers';
import { Router } from './router/router';
import { Helmet } from 'react-helmet';
import { ConsentModal } from './content/consentModal/ConsentModal';

export const App: React.FC = () => {
  const description =
    'AI-powered, browser-based database UI for Postgres, MySQL, and SQLite. The AI copilot can answer questions and generate SQL queries tailored to your database. View and edit your data in a user-friendly interface.';

  return (
    <>
      <Helmet>
        <title>SmartQuery</title>
        <meta name="description" content={description} />
      </Helmet>
      <Providers>
        <ConsentModal />
        <Router />
        <Footer />
      </Providers>
    </>
  );
};
