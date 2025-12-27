import './index.css';

import React from 'react';
import { Helmet } from 'react-helmet';
import { ConsentModal } from './content/consentModal/ConsentModal';
import { Providers } from './providers/Providers';
import { Router } from './router/router';
import { isElectron } from './content/native/useNative';

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
        {isElectron && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <div className="absolute h-6 w-full" style={{ WebkitAppRegion: 'drag' } as any}></div>
        )}
        <ConsentModal />
        <Router />
      </Providers>
    </>
  );
};
