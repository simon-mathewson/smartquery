import './index.css';

import React from 'react';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { Providers } from './providers/Providers';

export const App: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <ErrorBoundary>
      <Providers>{children}</Providers>
    </ErrorBoundary>
  );
};
