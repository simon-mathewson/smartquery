import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import React from 'react';
import { BaseProviders } from '~/baseProviders/BaseProviders';
import '../src/index.css';

beforeMount(async ({ App }) => React.createElement(BaseProviders, null, React.createElement(App)));
