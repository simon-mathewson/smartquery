import './index.css';

import React from 'react';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { Providers } from './providers/Providers';
import { Footer } from './content/footer/Footer';
import { Router } from './router/router';

export const App: React.FC = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <Providers>
        <Router />
        <Footer />
      </Providers>
    </ErrorBoundary>
  </React.StrictMode>
);
