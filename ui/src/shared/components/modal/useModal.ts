import { useCallback, useState } from 'react';

export const useModal = <Input = void>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<Input>();

  const open = useCallback((newInput: Input) => {
    setIsOpen(true);
    setInput(newInput);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInput(undefined);
  }, []);

  return { close, input, isOpen, open };
};
