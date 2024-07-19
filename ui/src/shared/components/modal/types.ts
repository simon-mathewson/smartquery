import type { useModal } from './useModal';

export type ModalControl<Input = void> = ReturnType<typeof useModal<Input>>;
