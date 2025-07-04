import './index.css';

import React from 'react';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { Providers } from './providers/Providers';
import { Footer } from './content/footer/Footer';
import { Router } from './router/router';
import { setUpErrorTracking } from './setUpErrorTracking';

const errorTracking = setUpErrorTracking();

export const App: React.FC = () => (
  <ErrorBoundary errorTracking={errorTracking}>
    <Providers>
      <Router />
      <Footer />
    </Providers>
  </ErrorBoundary>
);
