import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useCopilot = () => {
  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  return {
    isOpen,
    setIsOpen,
  };
};
