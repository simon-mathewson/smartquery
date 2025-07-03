import './index.css';

import React from 'react';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { Providers } from './providers/Providers';
import { Footer } from './content/footer/Footer';
import { Router } from './router/router';
import { setUpRum } from './setUpRum';

if (import.meta.env.PROD) {
  setUpRum();
}

export const App: React.FC = () => (
  <ErrorBoundary>
    <Providers>
      <Router />
      <Footer />
    </Providers>
  </ErrorBoundary>
);
