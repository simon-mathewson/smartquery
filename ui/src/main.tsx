import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from './router/router';
import { setUpAnalytics } from './content/analytics/setUpAnalytics';

setUpAnalytics();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
