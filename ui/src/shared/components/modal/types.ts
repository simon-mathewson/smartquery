import type { useModal } from './useModal';

export type ModalControl<Input = void, Result = void> = ReturnType<typeof useModal<Input, Result>>;
