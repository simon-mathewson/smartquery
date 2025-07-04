import './index.css';

import React from 'react';
import { Footer } from './content/footer/Footer';
import { Providers } from './providers/Providers';
import { Router } from './router/router';

export const App: React.FC = () => (
  <Providers>
    <Router />
    <Footer />
  </Providers>
);
