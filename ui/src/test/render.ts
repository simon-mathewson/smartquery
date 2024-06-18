import '../index.css';
import { BaseProviders } from '~/baseProviders/BaseProviders';
import type { RenderOptions } from '@testing-library/react';
import { render as originalRender } from '@testing-library/react';

export const render = (ui: React.ReactNode, options?: Omit<RenderOptions, 'queries'>) =>
  originalRender(ui, { wrapper: BaseProviders, ...options });
