import { useCallback, useRef, useState } from 'react';

export const useModal = <Input = void>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<Input>();

  const onCloseRef = useRef<() => void>();

  const open = useCallback((newInput: Input, options?: { onClose?: () => void }) => {
    setIsOpen(true);
    setInput(newInput);

    onCloseRef.current = options?.onClose;
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInput(undefined);

    onCloseRef.current?.();
    onCloseRef.current = undefined;
  }, []);

  return { close, input, isOpen, open };
};
