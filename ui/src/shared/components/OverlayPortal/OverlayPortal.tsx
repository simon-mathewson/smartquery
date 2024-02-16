import type { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export const OverlayPortal: React.FC<PropsWithChildren> = ({ children }) =>
  createPortal(children, document.getElementById('overlay')!);
