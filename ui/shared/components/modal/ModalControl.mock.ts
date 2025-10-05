import { spy } from 'tinyspy';
import type { ModalControl } from './types';

export const getModalControlMock = () =>
  ({
    close: spy(),
    input: undefined,
    isOpen: true,
    open: spy(),
  }) satisfies ModalControl<unknown>;
