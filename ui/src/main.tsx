import React from 'react';
import './index.css';

import ReactDOM from 'react-dom/client';
import { Router } from './router/router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
